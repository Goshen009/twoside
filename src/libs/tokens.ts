import { randomBytes, createHash } from "crypto";
import { IncomingHttpHeaders } from "http";
import { Config } from "#/plugins/env.js";

import { PendingTokenAction, PrismaClient } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";

import jwt from "jsonwebtoken";

export interface JWTPayload {
	id: string,
}

const PENDING_TOKEN_EXPIRY_MILLISECONDS = 180 * 1000; // 3 minutes
const REFRESH_EXPIRY_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_EXPIRY = '2d';

class Tokens {
	private static COOKIE_DOMAIN(config: Config): string | undefined {
	  switch (config.ENVIRONMENT) {
	    case "local":
	      return undefined;
	    case "staging":
	      return "develop.twoside.dev";
	    case "production":
	      return "twoside.dev";
	    default:
	      return undefined;
	  }
	}
	
	static COOKIE_CONFIG(config: Config) {
		return {
      path: '/auth',
    	httpOnly: true,
     	sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      secure: !(config.ENVIRONMENT === 'local'),
      ...(this.COOKIE_DOMAIN(config) && { domain: this.COOKIE_DOMAIN(config) }),
    };
	}

	static PENDING_COOKIE_CONFIG(config: Config) {
	  return {
	    ...this.COOKIE_CONFIG(config),
	    maxAge: PENDING_TOKEN_EXPIRY_MILLISECONDS / 1000,
	  };
	}
	
	private static generateHash(value: string) {
    return createHash("sha256").update(value).digest("hex");
	}

  private static generateAccessToken(config: Config, payload: JWTPayload) {
		return jwt.sign(payload, config.JWT_SECRET, {
			expiresIn: ACCESS_EXPIRY
		})
	}

	static verifyAccessToken(config: Config, headers: IncomingHttpHeaders): JWTPayload {
		const auth_header = headers.authorization;
		if (!auth_header?.startsWith("Bearer ")) {
	    throw APIError.invalidOrMissingToken();
	  }
	
	  const token = auth_header.substring(7);
	  if (!token) {
	    throw APIError.invalidOrMissingToken();
	  }
	
		try {
			return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
		} catch (err) {
			throw APIError.invalidOrMissingToken();
		}
	}

	static async createPendingToken(prisma: PrismaClient, email: string, action: PendingTokenAction): Promise<string> {
		const pending_token = randomBytes(32).toString('hex');
		
		const token_hash = this.generateHash(pending_token);
		const expires_at = new Date(Date.now() + PENDING_TOKEN_EXPIRY_MILLISECONDS);

		await prisma.pendingToken.upsert({
			where: { email },
			create: { email, token_hash, expires_at, action },
			update: { token_hash, expires_at, action }
		});
		return pending_token;
	}

	static async verifyPendingToken(prisma: PrismaClient, pending_token: string): Promise<{ email: string, action: PendingTokenAction}> {
		const record = await prisma.pendingToken.findUnique({
			where: { token_hash: this.generateHash(pending_token )}
		});

		if (!record || record.expires_at < new Date())
			throw APIError.expiredPendingToken();

		await prisma.pendingToken.delete({ where: { email: record.email }});
		return { email: record.email, action: record.action };
	}

  static async create(prisma: PrismaClient, config: Config, user_id: string): Promise<{ refresh_token: string, access_token: string, user_id: string }> {
  	const access_token = this.generateAccessToken(config, { id: user_id });
   	const refresh_token = randomBytes(32).toString('hex');
    
    await prisma.refreshToken.create({
      data: { 
      	token_hash: this.generateHash(refresh_token), 
       	user_id, 
        expires_at: new Date(Date.now() + REFRESH_EXPIRY_MILLISECONDS)
      }
    });
    return { refresh_token, access_token, user_id };
  }

  // verifies the token, burns it, and issues a fresh one — rotation means a
  // stolen-but-unused refresh token becomes worthless the moment the real
  // user refreshes normally.
  static async rotate(prisma: PrismaClient, config: Config, refresh_token: string): Promise<{ refresh_token: string, access_token: string, user_id: string }> {
    const record = await prisma.refreshToken.findUnique({ 
    	where: { token_hash: this.generateHash(refresh_token) }
    });

    if (!record || record.expires_at < new Date())
      throw APIError.custom({ status: 401, message: "Your session has expired. Please log in again." });

    await prisma.refreshToken.delete({ where: { id: record.id } });
    return await this.create(prisma, config, record.user_id);
  }

  static async revoke(prisma: PrismaClient, refresh_token: string) {
    const token_hash = this.generateHash(refresh_token);
    await prisma.refreshToken.deleteMany({ where: { token_hash } });
  }

  static async revokeAll(prisma: PrismaClient, user_id: string) {
    await prisma.refreshToken.deleteMany({ where: { user_id } });
  }
}

export default Tokens;