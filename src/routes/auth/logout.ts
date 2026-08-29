import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const incoming = request.cookies.refresh_token;

  if (incoming)
    await Tokens.revoke(this.prisma, incoming);
  
  return reply
  	.clearCookie('refresh_token', { path: '/auth' })
   	.code(200)
    .send({ message: 'Logged out successfully!' });
}

export const logout = { handler };