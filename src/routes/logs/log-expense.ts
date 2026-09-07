import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Domain from "#/libs/domain.js";
import Ledger from "#/libs/ledger.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	category_name: z.string("Category name must be a string").trim().min(1, "Category name must not be empty").max(100, "Category name must not be more than 100 letters").nullable().default(null),
  sources: TransactionSchemas.accountAllocations("source"),
  bypass_warnings: TransactionSchemas.bypassWarnings(['INSUFFICIENT_BALANCE']),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { description, transaction_date, category_name, sources, bypass_warnings } = request.body;
	
  const source_lines = sources.map(s => {
  	const account = Ledger.checkAccount(s.account_id, user.accounts);
  	if (account.type !== 'ASSET')
   		throw APIError.custom({ status: 400, message: "An expense can only be paid out of an asset account" });
   
   	return { ...account, total_amount: Calc.toDecimalNumber(Calc.toWholeNumber(s.amount ) + Calc.toWholeNumber(s.charge)), charge_amount: s.charge || null, cashflow_direction: 'DECREASE' as const };
  });
	
  const total_amount = Calc.toDecimalNumber(sources.reduce((sum, s) => sum + Calc.toWholeNumber(s.amount), 0));
  const total_charges = Calc.toDecimalNumber(sources.reduce((sum, s) => sum + Calc.toWholeNumber(s.charge), 0));
  
  const expense_account = user.system_accounts.EXPENSE!;
  
  await this.prisma.$transaction(async (tx) => {
  	if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
   		await Ledger.checkSufficientBalance(tx, source_lines, new Date(transaction_date), user.currency_symbol);
   	}
  
  	const resolved_category_id = category_name 
   		? await Domain.enableOrCreateCategory(tx, user.id, category_name)
     	: null;

   	const charge_line = total_charges > 0
    	? [{
   				...expense_account,
          total_amount: total_charges,
          charge_amount: null,
          cashflow_direction: 'INCREASE' as const,
          category_id: user.charge_category.id
     		}]
     	: [];
  
  	await Ledger.logTransaction(tx, {
 			user_id: user.id,
   		description,
    	transaction_date: new Date(transaction_date),
    	log_type: 'EXPENSE',
     	lines: [
    		...source_lines.map(l => ({ ...l, category_id: resolved_category_id })),
      	...charge_line,
     		{ ...expense_account, total_amount: total_amount, charge_amount: null, cashflow_direction: 'INCREASE' as const, category_id: resolved_category_id }
      ]
   	})
  });
  
  return reply.code(200).send({ message: "Successful" });
}

export const log_expense = { handler, schema: { body: schema } };