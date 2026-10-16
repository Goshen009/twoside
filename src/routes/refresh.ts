import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Device } from "#/prisma/enums.js";
import { z } from "zod/v4";

import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.cookies.refresh_token)
  	throw APIError.sessionExpired();

  const { access_token, refresh_token, user_id } = await Tokens.rotate(this.prisma, this.config, request.cookies.refresh_token);

  // handling app open logging. 
  // it should be very very very fire and forget and should not break anything or obstruct
  // refresh flow if something goes wrong.
  const parsed = z.object({
    is_pwa: z.boolean(),
    device: z.enum(Device),
  }).safeParse(request.body);
  
  if (parsed.success) {
    void this.prisma.appOpen.create({ 
    	data: { ...parsed.data, user_id }
    }).catch((err) => this.log.warn({ err }, "app open tracking failed"));
  }

  return reply
 		.header('Authorization', `Bearer ${access_token}`)
  	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config, 'REFRESH'))
  	.code(200).send({});
}

export const refresh = { handler };