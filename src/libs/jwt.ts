import { APIError } from "#/errors/APIError.js";
import { IncomingHttpHeaders } from "http";

import { Config } from "#/plugins/env.js";
import jwt from "jsonwebtoken";

export interface JWTPayload {
	id: string,
}

// TODO: The expiresIn still has to be set

class JWT {
	static generate(config: Config, payload: JWTPayload) {
		return jwt.sign(payload, config.JWT_SECRET, {
			expiresIn: '2d'
		})
	}
	
	static verify(config: Config, headers: IncomingHttpHeaders): JWTPayload {
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
}

export default JWT;