import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Google from "#/libs/google.js";
import Tokens from "#/libs/tokens.js";

const schema = z.object({
  code: z.string('Code must be a string').min(1, 'Code is required'),
  state: z.string('State must be a string').min(1, 'State is required'),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const { code, state } = request.body;
  const cookie_state = request.cookies.google_oauth_state;
	
  reply.clearCookie('google_oauth_state', Tokens.COOKIE_CONFIG(this.config, 'GOOGLE'));
	
  if (!cookie_state || cookie_state !== state)
  	throw APIError.forbidden("Expired or invalid login attempt. Please try again.");

  const profile = await Google.exchangeCode(this.config, code);
  
  const user = await this.prisma.user.upsert({
  	where: { google_account_id: profile.sub },
   	update: { },
    create: {
    	name: profile.name,
     	google_account_id: profile.sub,
    	timezone: 'Africa/Lagos',
	    accounts: {
				createMany: {
					data: [
						{ name: "Wallet", type: "ASSET" },
						{ name: "Expense", type: "EXPENSE" }
					]
				}
			}
    }
  });

  const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);
  
  return reply
  	.header('Authorization', `Bearer ${access_token}`)
   	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config, 'REFRESH'))
   	.code(200).send({});
}

export const google_callback = { handler, schema: { body: schema } };