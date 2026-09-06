import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Ledger from "#/libs/ledger.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	amount: z.number("Amount must be a number").positive("Amount must be greater than 0").multipleOf(0.01, "Amount must be in 2dp"),
	from_account_id: z.uuid("from_account_id is required and must be a valid UUID"),
	to_account_id: z.uuid("to_account_id is required and must be a valid UUID"),
	bypass_warnings: TransactionSchemas.bypassWarnings(['INSUFFICIENT_BALANCE']),
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
	
  const { description, transaction_date, amount, from_account_id, to_account_id, bypass_warnings } = request.body;

  const from_account = Ledger.checkAccount(from_account_id, user.accounts);
  const to_account = Ledger.checkAccount(to_account_id, user.accounts);

  if (from_account.type !== 'ASSET' || to_account.type !== 'ASSET')
  	throw APIError.custom({ status: 400, message: "Transfers are only allowed between asset accounts" });

  await this.prisma.$transaction(async (tx) => {
 		if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
  		await Ledger.checkSufficientBalance(tx, [{...from_account, amount}], new Date(transaction_date), user.currency, user.locale);
  	}
   
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	transaction_date: new Date(transaction_date),
    	log_type: 'TRANSFER',
     	lines: [
     		{ ...from_account, amount, cashflow_direction: 'DECREASE' as const },
       	{ ...to_account, amount, cashflow_direction: 'INCREASE' as const }
      ]
   	})
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_transfer = { handler, schema: { body: schema } };