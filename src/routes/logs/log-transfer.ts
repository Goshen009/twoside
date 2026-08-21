import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";
import Balance from "#/libs/balance.js";

const schema = z.object({
	...Balance.zod(),
	from_account_id: z.uuid("from_account_id is required and must be a valid UUID"),
	to_account_id: z.uuid("to_account_id is required and must be a valid UUID")
}).refine(data => data.from_account_id !== data.to_account_id, {
	error: "You cannot transfer money into the same account",
	path: ['to_account_id']
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { description, trx_date, amount, from_account_id, to_account_id } = request.body;

  const from_account = Balance.checkAccount(from_account_id, user.accounts);
  const to_account = Balance.checkAccount(to_account_id, user.accounts);

  // A transfer only moves money between accounts you hold. Anything touching
  // income/expense/equity/liabilities must go through its own /log endpoint.
  if (from_account.type !== 'ASSET' || to_account.type !== 'ASSET')
  	throw APIError.custom({ status: 400, message: "Transfers are only allowed between asset accounts" });

  const accounts = [
  	{ ...from_account, amount, cashflow_direction: 'DECREASE' as const },
    { ...to_account, amount, cashflow_direction: 'INCREASE' as const }
  ]

  Balance.trialBalance(accounts);

  await this.prisma.$transaction(async (tx) => {
  	await tx.transactionGroup.create({
   		data: {
   			user_id: user.id,
     		journal_entries: {
     			create: accounts.map(a => ({
      			trx_date,
       			description,
          	amount: a.amount,
           	side: Balance.resolveEntrySide(a.increases_with, a.cashflow_direction),
            account_id: a.id,
            category_id: null
        	}))
       	}  
     	}
   	});

		await Balance.rebuildSnapshots(tx, accounts, trx_date);
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_transfer = { handler, schema: { body: schema } };