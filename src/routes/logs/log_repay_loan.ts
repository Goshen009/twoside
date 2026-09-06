import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { LoanDirection } from "#/prisma/client.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Ledger from "#/libs/ledger.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	loan_id: z.uuid("Loan ID is required and must be a valid UUID"),
  sources: TransactionSchemas.accountAllocations("source"),
  bypass_warnings: TransactionSchemas.bypassWarnings(['INSUFFICIENT_BALANCE', 'REPAYMENT_DATED_BEFORE']),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, loan_id, sources, bypass_warnings } = request.body;

  const total_amount = Calc.toDecimalNumber(sources.reduce((sum, s) => sum + Calc.toWholeNumber(s.amount), 0));
  
  const source_lines = sources.map(s => {
  	const account = Ledger.checkAccount(s.account_id, user.accounts);
  	if (account.type !== 'ASSET')
   		throw APIError.custom({ status: 400, message: "Loans can only be repaid from asset accounts." });
   
   	return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
  });

  const payables_account = user.system_accounts.PAYABLES!;

  await this.prisma.$transaction(async (tx) => {
  	const loan = await Ledger.checkLoan(tx, user.id, loan_id, LoanDirection.BORROWED, total_amount, new Date(transaction_date), bypass_warnings);
    
  	if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
  		await Ledger.checkSufficientBalance(tx, source_lines, new Date(transaction_date), user.currency, user.locale);
  	}
   
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      transaction_date: new Date(transaction_date),
      log_type: 'REPAY_LOAN',
      lines: [
        ...source_lines,
        { ...payables_account, amount: total_amount, cashflow_direction: 'DECREASE' as const },
      ],
      repayments: [{ loan_id: loan.id, amount: total_amount }],
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_repay_loan = { handler, schema: { body: schema } };