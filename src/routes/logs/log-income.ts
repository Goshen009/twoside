import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Ledger from "#/libs/ledger.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
  ...TransactionSchemas.commonFields(),
  destinations: TransactionSchemas.accountAllocations("destination"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	const { description, transaction_date, destinations } = request.body;
	
  const destination_lines = destinations.map((d) => {
    const account = Ledger.checkAccount(d.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: "Income can only be received into an asset account" });

    return { ...account, amount: d.amount, cashflow_direction: 'INCREASE' as const };
  });
	
  const total_amount = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.amount), 0));
  const income_account = user.system_accounts.INCOME!;

  await this.prisma.$transaction(async (tx) => {
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	transaction_date: new Date(transaction_date),
    	log_type: 'INCOME',
     	lines: [
    		...destination_lines,
     		{ ...income_account, amount: total_amount, cashflow_direction: 'INCREASE' as const }
      ]
   	})
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_income = { handler, schema: { body: schema } };