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

    const net_amount = Calc.toDecimalNumber(Calc.toWholeNumber(d.amount) - Calc.toWholeNumber(d.charge));
    return { ...account, total_amount: net_amount, charge_amount: d.charge || null, cashflow_direction: 'INCREASE' as const };
  });
	
  const total_amount = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.amount), 0));
  const total_charges = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.charge), 0));

  const income_account = user.system_accounts.INCOME!;
  const expense_account = user.system_accounts.EXPENSE!;

  await this.prisma.$transaction(async (tx) => {
 		const charge_line = total_charges > 0
      ? [{
        	...expense_account,
         	total_amount: total_charges,
          charge_amount: null,
          cashflow_direction: 'INCREASE' as const,
          category_id: user.charge_category.id,
        }]
      : [];
  
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	transaction_date: new Date(transaction_date),
    	log_type: 'INCOME',
     	lines: [
    		...destination_lines,
    		...charge_line,
      	{ ...income_account, total_amount, charge_amount: null, cashflow_direction: 'INCREASE' as const }
      ]
   	})
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_income = { handler, schema: { body: schema } };