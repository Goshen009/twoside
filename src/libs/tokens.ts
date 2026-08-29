import { PrismaClient } from "#/prisma/client.js";
import { randomBytes, createHash } from "crypto";
import { APIError } from "#/errors/APIError.js";
import { IncomingHttpHeaders } from "http";
import { Config } from "#/plugins/env.js";
import jwt from "jsonwebtoken";

export interface JWTPayload {
	id: string,
}

const REFRESH_EXPIRY_MILLISECONDS = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_EXPIRY = '2d';

class Tokens {
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

  static async create(prisma: PrismaClient, config: Config, user_id: string): Promise<{ refresh_token: string, access_token: string }> {
  	const access_token = this.generateAccessToken(config, { id: user_id });
   	const refresh_token = randomBytes(32).toString('hex');
    
    await prisma.refreshToken.create({
      data: { 
      	token_hash: this.generateHash(refresh_token), 
       	user_id, 
        expires_at: new Date(Date.now() + REFRESH_EXPIRY_MILLISECONDS)
      }
    });
    return { refresh_token, access_token };
  }

  // verifies the token, burns it, and issues a fresh one — rotation means a
  // stolen-but-unused refresh token becomes worthless the moment the real
  // user refreshes normally.
  static async rotate(prisma: PrismaClient, config: Config, refresh_token: string): Promise<{ refresh_token: string, access_token: string }> {
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