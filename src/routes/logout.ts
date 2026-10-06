import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	if (request.cookies.refresh_token)
		await Tokens.revoke(this.prisma, request.cookies.refresh_token);

  reply.clearCookie('refresh_token', Tokens.COOKIE_CONFIG(this.config, 'REFRESH'));
  
  return reply.code(200).send({ message: 'Logged out successfully!' });
}

export const logout = { handler };