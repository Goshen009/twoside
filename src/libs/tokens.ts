import { randomBytes, createHash } from "crypto";
import { IncomingHttpHeaders } from "http";
import { Config } from "#/plugins/env.js";

import {PrismaClient } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";

import jwt from "jsonwebtoken";

export interface JWTPayload {
	id: string,
}

const REFRESH_EXPIRY = 60 * 60 * 24 * 30; // 30 days
const REFRESH_EXPIRY_MILLISECONDS = REFRESH_EXPIRY * 1000;
const ACCESS_EXPIRY = '10m';

class Tokens {	
	static COOKIE_CONFIG(config: Config, type: 'GOOGLE' | 'REFRESH') {
		return {
      path: '/',
    	httpOnly: true,
     	sameSite: 'lax' as const,
      maxAge: (() => {
      	switch (type) {
       		case 'GOOGLE': return 120;
         	case 'REFRESH': return REFRESH_EXPIRY
       	}
      })(),
      domain: (() => {
      	switch (config.ENVIRONMENT) {
       		case "local": return undefined;
         	case "staging": return "beta.twoside.dev";
          case "production": return "twoside.dev";
       	}
      })(),
      secure: config.ENVIRONMENT === 'local' ? undefined : true,
    };
	}
	
	private static generateHash(value: string) {
    return createHash("sha256").update(value).digest("hex");
	}

  static generateAccessToken(config: Config, payload: JWTPayload) {
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

  static async rotate(prisma: PrismaClient, config: Config, refresh_token: string): Promise<{ refresh_token: string, access_token: string, user_id: string }> {
    const record = await prisma.refreshToken.findUnique({ 
    	where: { token_hash: this.generateHash(refresh_token) }
    });

    if (!record || record.expires_at < new Date())
    	throw APIError.sessionExpired();

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