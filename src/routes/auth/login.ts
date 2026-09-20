import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

import Tokens from "#/libs/tokens.js";
import OTP from "#/libs/otp.js";

const schema = z.object({
	email: z.email().trim(),
	otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const { email, otp } = request.body;

  await OTP.verify(this.prisma, otp, email);

	const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true, profile: { select: { user_id: true }  } }});

	if (!user) {
		const pending_token = await Tokens.createPendingToken(this.prisma, email, 'REGISTER');
		return reply
			.setCookie('pending_token', pending_token, Tokens.PENDING_COOKIE_CONFIG(this.config))
			.code(200)
			.send({
				status: 'NOT_FOUND'
			});
	}

	const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);

  return reply
  	.header('authorization', `Bearer ${access_token}`)
   	.setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config))
  	.code(200)
   	.send({ 
    	status: user.profile ? 'FULLY_REGISTERED' : 'REQUIRES_ONBOARDING',
     	email,
      ...(this.config.ENVIRONMENT !== 'production' && { refresh_token })
    });
}

export const login = { handler, schema: { body: schema } };