import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Ledger from "#/libs/ledger.js";
import TransactionSchemas from "#/libs/transaction-schemas.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	category_id: z.uuid("category_id must be a valid UUID").nullable().default(null),
  sources: TransactionSchemas.accountAllocations("source"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { description, trx_date, category_id, sources } = request.body;

	if (category_id)
		await Ledger.checkCategory(this.prisma, user.id, category_id);
	
  const source_lines = sources.map((s) => {
    const account = Ledger.checkAccount(s.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: "An expense can only be paid out of an asset account" });

    return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
  });
	
  const total_amount = sources.reduce((sum, s) => sum + s.amount, 0);
  const expense_account = user.system_accounts.EXPENSE!;
  
  await this.prisma.$transaction(async (tx) => {
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	trx_date: new Date(trx_date),
     	lines: [
    		...source_lines,
     		{ ...expense_account, amount: total_amount, cashflow_direction: 'INCREASE' as const, category_id }
      ]
   	})
  });
  
  return reply.code(200).send({ message: "Successful" });
}

export const log_expense = { handler, schema: { body: schema } };