import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

import Google from "#/libs/google.js";
import Tokens from "#/libs/tokens.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const state = randomUUID();
  const url = Google.getAuthUrl(this.config, state)

  return reply
  	.setCookie('google_oauth_state', state, Tokens.COOKIE_CONFIG(this.config, 'GOOGLE'))
  	.code(200)
  	.send({ url });
}

export const get_google_auth_url = { handler };