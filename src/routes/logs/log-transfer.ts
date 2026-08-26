import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Balances from "#/libs/balances.js";
import Ledger from "#/libs/ledger.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	amount: z.number("amount is required and must be a number").positive("amount must be greater than 0").multipleOf(0.01),
	from_account_id: z.uuid("from_account_id is required and must be a valid UUID"),
	to_account_id: z.uuid("to_account_id is required and must be a valid UUID"),
	bypass_warnings: z.boolean().default(false)
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
	
  const { description, trx_date, amount, from_account_id, to_account_id, bypass_warnings } = request.body;

  const from_account = Ledger.checkAccount(from_account_id, user.accounts);
  const to_account = Ledger.checkAccount(to_account_id, user.accounts);

  if (!bypass_warnings) {
   	const balance_in_account = await Balances.getBalanceAtDate(this.prisma, from_account.id, from_account.type, new Date(trx_date));
		if (Calc.toWholeNumber(balance_in_account) < Calc.toWholeNumber(amount))
	  	throw APIError.custom({ status: 403, message: `${from_account.name} only has ${balance_in_account.toFixed(2)}, but ${amount.toFixed(2)} was requested.` });
  }

  // A transfer only moves money between accounts you hold. Anything touching
  // income/expense/equity/liabilities must go through its own /log endpoint.
  if (from_account.type !== 'ASSET' || to_account.type !== 'ASSET')
  	throw APIError.custom({ status: 400, message: "Transfers are only allowed between asset accounts" });

  await this.prisma.$transaction(async (tx) => {
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	trx_date: new Date(trx_date),
     	lines: [
     		{ ...from_account, amount, cashflow_direction: 'DECREASE' as const },
       	{ ...to_account, amount, cashflow_direction: 'INCREASE' as const }
      ]
   	})
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_transfer = { handler, schema: { body: schema } };