import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";

import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.cookies.refresh_token)
  	throw APIError.sessionExpired();

  const { access_token, refresh_token  } = await Tokens.rotate(this.prisma, this.config, request.cookies.refresh_token);

  return reply
 		.header('Authorization', `Bearer ${access_token}`)
  	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config, 'REFRESH'))
  	.code(200).send({});
}

export const refresh = { handler };