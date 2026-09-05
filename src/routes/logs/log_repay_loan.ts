import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { LoanDirection } from "#/prisma/client.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Balances from "#/libs/balances.js";
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

  const loan = await Ledger.checkLoan(this.prisma, user.id, loan_id, LoanDirection.BORROWED);

  if (!bypass_warnings.includes("REPAYMENT_DATED_BEFORE")) {
 		if (new Date(transaction_date) < loan.date_issued)
   		throw APIError.warning("REPAYMENT_DATED_BEFORE", TransactionSchemas.repaymentDatedBeforeMessage(loan.date_issued));
  }

  const total_amount = Calc.toDecimalNumber(sources.reduce((sum, s) => sum + Calc.toWholeNumber(s.amount), 0));
  
  if (Calc.toWholeNumber(total_amount) > loan.remaining_cents)
    throw APIError.custom({ status: 400, message: `This payment exceeds what's left on this loan` });
  
  const source_lines = await Promise.all(
 		sources.map(async (s) => {
 			const account = Ledger.checkAccount(s.account_id, user.accounts);
    	if (account.type !== 'ASSET')
     		throw APIError.custom({ status: 400, message: "Loans can only be repaid from asset accounts." });

     	if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
	     	const balance_in_account = await Balances.getBalanceAtDate(this.prisma, account.id, account.type, new Date(transaction_date));
				if (Calc.toWholeNumber(balance_in_account) < Calc.toWholeNumber(s.amount))
					throw APIError.warning("INSUFFICIENT_BALANCE", TransactionSchemas.insufficientBalanceMessage(account.name, balance_in_account, s.amount));
      }
      
     	return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
   	})
  );

  const payables_account = user.system_accounts.PAYABLES!;

  await this.prisma.$transaction(async (tx) => {
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