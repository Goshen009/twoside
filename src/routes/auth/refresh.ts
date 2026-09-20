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

  const { access_token, refresh_token, user_id } = await Tokens.rotate(this.prisma, this.config, incoming);
  
  const user = await this.prisma.user.findUnique({ where: { id: user_id }, select: { email: true, profile: { select: { user_id: true }  } }});
  
  return reply
  	.header('Authorization', `Bearer ${access_token}`)
  	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config))
   	.code(200)
    .send({ 
    	status: user!.profile ? 'FULLY_REGISTERED' : 'REQUIRES_ONBOARDING',
     	email: user!.email,
     	...(this.config.ENVIRONMENT !== 'production' && { refresh_token })
    });
}

export const refresh = { handler };