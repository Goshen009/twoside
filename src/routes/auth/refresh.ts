import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";

import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const incoming = request.cookies.refresh_token;

  if (!incoming)
    throw APIError.custom({ status: 401, message: "No session found. Please log in again." });

  const { access_token, refresh_token  } = await Tokens.rotate(this.prisma, this.config, incoming);

  return reply
  	.header('Authorization', `Bearer ${access_token}`)
  	.setCookie('refresh_token', refresh_token, {
	  	httpOnly: true,
	    sameSite: 'lax',
	    secure: this.config.ENVIRONMENT === 'production',
	    maxAge: 30 * 24 * 60 * 60,
	    path: '/auth'
	  })
   	.code(200)
    .send({ message: "Successful" });
}

export const refresh = { handler };