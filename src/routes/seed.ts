import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Password from "#/libs/password.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const password = await Password.hash('000000');

	const balance_snapshots = {
  	create: [
   		{ balance: 0, as_of_date: new Date() }
   	]
  };
	
	await this.prisma.user.create({
		data: {
			id: '245baa2f-cefe-45ad-8505-9278fe7cf4c4',
			username: 'goshen',
			password,
			currency_symbol: '₦', // hardcoded for now,
      iana_timezone: 'Africa/Lagos', // hardcoded for now
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
	
  return reply.code(201).send({ message: "Success!" });
}

export const seed = { handler };