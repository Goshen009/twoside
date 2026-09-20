import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";

import Tokens from "#/libs/tokens.js";
import User from "#/libs/user.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const pending_token = request.cookies.pending_token;

	if (!pending_token)
		throw APIError.expiredPendingToken();

	const { email, action } = await Tokens.verifyPendingToken(this.prisma, pending_token);

	if (action === 'REGISTER') {
		// they were on login, email didn't exist, chose to create an account
    const user = await User.create(this.prisma, email);
		
    // user should never be null here (email was already confirmed not to exist
    // moments ago) — but if it somehow raced, treat as a real error, not a silent branch
    if (!user) throw APIError.internalServerError();
		
    const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);
		
    return reply
      .header('authorization', `Bearer ${access_token}`)
    	.clearCookie('pending_token', { path: '/auth' })
      .setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config))
      .code(200)
      .send({
        status: 'REQUIRES_ONBOARDING',
        email: user.email,
        ...(this.config.ENVIRONMENT !== 'production' && { refresh_token })
      });
	}

	// action === 'LOGIN'
  // they were on register, email already existed, chose to sign in instead
  const user = await this.prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, profile: { select: { user_id: true } } }
  });
	
  if (!user) throw APIError.internalServerError();
	
  const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);
	
  return reply
    .header('authorization', `Bearer ${access_token}`)
  	.clearCookie('pending_token', { path: '/auth' })
    .setCookie('refresh_token', refresh_token, Tokens.COOKIE_CONFIG(this.config))
    .code(200)
    .send({
      status: user.profile ? 'FULLY_REGISTERED' : 'REQUIRES_ONBOARDING',
      email: user.email,
      ...(this.config.ENVIRONMENT !== 'production' && { refresh_token })
    });
}

export const confirm_pending_token = { handler };