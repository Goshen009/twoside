import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { JWT, Password } from "#/libs/index.js";
import { z } from "zod/v4";

const schema = z.object({
	username: z.string("username must be a string").min(5, "username must be at least 5 characters").max(100, "username must not be more than 100 characters"),
	pin: z.string("pin is required").regex(/^\d{6}$/, "pin must be 6 digits"),
	confirm_pin: z.string("confirm pin is required").regex(/^\d{6}$/, "confirm pin must be 6 digits"),
}).refine(data => data.pin === data.confirm_pin, {
	error: "Pins do not match",
	path: ['confirm_pin']
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { username, pin } = request.body;

  const password = await Password.hash(pin);

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
	       		{ name: 'Cash', type: 'ASSET', default: 'CASH', balance_snapshots },
		      	{ name: 'Bank', type: 'ASSET', default: 'BANK', balance_snapshots },
						{ name: 'Equity', type: 'EQUITY', default: null, balance_snapshots },
						{ name: 'Savings', type: 'ASSET', default: null, balance_snapshots },
						{ name: 'Income', type: 'INCOME', default: 'INCOME', balance_snapshots },
						{ name: 'Expense', type: 'EXPENSE', default: 'EXPENSE', balance_snapshots },
						{ name: 'Payables', type: 'LIABILITY', default: 'PAYABLES', balance_snapshots },
						{ name: 'Recieveables', type: 'ASSET', default: 'RECEIVABLES', balance_snapshots },
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

  const token = JWT.generate(this.config, { id: user.id });

  return reply
    .header('Authorization', `Bearer ${token}`)
   	.code(201)
    .send({ message: "Successful" });
}

export const register_user = { handler, schema: { body: schema } };