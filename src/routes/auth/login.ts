import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Password from "#/libs/password.js";
import Tokens from "#/libs/tokens.js";

const LOCKOUT_THRESHOLD = 5;
const BASE_LOCKOUT_MINUTES = 5;
const MAX_LOCKOUT_MINUTES = 60 * 24;

const schema = z.object({
	username: z.string("Username must be a string").min(5, "Username must be at least 5 characters").max(100, "Username must not be more than 100 characters"),
	password: z.string("Password is required").trim().min(6, "Password must be at least 6 letters").max(100, "Password must not be more than 100 letters"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { username, password } = request.body;

  const login_attempts = await this.prisma.loginAttempts.findUnique({ where: { username } });

  if (login_attempts && login_attempts.locked_until && login_attempts.locked_until > new Date()) {
  	const ms_left = login_attempts.locked_until.getTime() - Date.now();
   	const hours_left = Math.floor(ms_left / 3600000);
	  const minutes_left = Math.ceil((ms_left % 3600000) / 60000);

		const time = hours_left > 0
			? `${hours_left} hour${hours_left === 1 ? '' : 's'} and ${minutes_left} minute${minutes_left === 1 ? '' : 's'}`
		  : `${minutes_left} minute${minutes_left === 1 ? '' : 's'}`;

		throw APIError.rateLimit(`You've tried logging in a whole lot. Try again in ${time}.`);
  }

  const user = await this.prisma.user.findUnique({ where: { username } });

  if (!user || !await Password.verify(user.password, password)) {
  	const attempt = await this.prisma.loginAttempts.upsert({
 			where: { username },
   		create: { username, attempts: 1, locked_until: null },
     	update: { attempts: { increment: 1 } }
   	});

   	if (attempt.attempts % LOCKOUT_THRESHOLD === 0) {
   		const lockout_count = attempt.attempts / LOCKOUT_THRESHOLD;
    	const lockout_minutes = Math.min(BASE_LOCKOUT_MINUTES * Math.pow(2, lockout_count - 1), MAX_LOCKOUT_MINUTES);

     	await this.prisma.loginAttempts.update({
      	where: { username },
       	data: { locked_until: new Date(Date.now() + lockout_minutes * 60 * 1000) }
      });
    }

    throw APIError.invalidCredentials();
  }

  if (login_attempts) // delete any attempt record on successful login
    	await this.prisma.loginAttempts.delete({ where: { username } });

  const { access_token, refresh_token } = await Tokens.create(this.prisma, this.config, user.id);

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

export const login = { handler, schema: { body: schema } };