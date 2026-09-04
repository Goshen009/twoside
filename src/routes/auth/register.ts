import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import Password from "#/libs/password.js";
import Tokens from "#/libs/tokens.js";

const schema = z.object({
	username: z.string("Username must be a string").trim().min(5, "Username must be at least 5 letters").max(100, "Username must not be more than 100 letters"),
	password: z.string("Password is required").trim().min(6, "Password must be at least 6 letters").max(100, "Password must not be more than 100 letters"),
})

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { username, password: password_from_body } = request.body;

  const password = await Password.hash(password_from_body);

  const balance_snapshots = {
  	create: [
   		{ balance: 0, as_of_date: new Date() }
   	]
  };

  let user;
  try {
  	user = await this.prisma.user.create({
 			data: {
  			username,
   			password,
     		accounts: {
     			create: [
	       		{ name: 'Cash', type: 'ASSET', system_role: null, balance_snapshots },
			     	{ name: 'Bank', type: 'ASSET', system_role: null, balance_snapshots },
						{ name: 'Savings', type: 'ASSET', system_role: null, balance_snapshots },
						{ name: 'Equity', type: 'EQUITY', system_role: 'EQUITY', balance_snapshots },
						{ name: 'Income', type: 'INCOME', system_role: 'INCOME', balance_snapshots },
						{ name: 'Expense', type: 'EXPENSE', system_role: 'EXPENSE', balance_snapshots },
						{ name: 'Payables', type: 'LIABILITY', system_role: 'PAYABLES', balance_snapshots },
						{ name: 'Recieveables', type: 'ASSET', system_role: 'RECEIVABLES', balance_snapshots },
	        ]
       	}
    	}
   	});
  } catch (err) {
 		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
  		throw APIError.validationError([{ field: 'username', message: 'This username has been taken by another fellow.' }]);
   	}
	  throw err;
  }

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

export const register_user = { handler, schema: { body: schema } };