import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { LoanDirection } from "#/prisma/client.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";
import Ledger from "#/libs/ledger.js";
import TransactionSchemas from "#/libs/transaction-schemas.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	loan_id: z.uuid("Loan ID is required and must be a valid UUID"),
  destinations: TransactionSchemas.accountAllocations("destination"),
  bypass_warnings: TransactionSchemas.bypassWarnings(['REPAYMENT_DATED_BEFORE']),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, loan_id, destinations, bypass_warnings } = request.body;

  const destination_lines = destinations.map((d) => {
    const account = Ledger.checkAccount(d.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: `Repayments can only be received into asset accounts` });

    const net_amount = Calc.toDecimalNumber(Calc.toWholeNumber(d.amount) - Calc.toWholeNumber(d.charge));
    return { ...account, total_amount: net_amount, charge_amount: d.charge || null, cashflow_direction: 'INCREASE' as const };
  });

  const total_amount = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.amount), 0));
  const total_charges = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.charge), 0));

  const receivables_account = user.system_accounts.RECEIVABLES!;
  const expense_account = user.system_accounts.EXPENSE!;

  await this.prisma.$transaction(async (tx) => {
  	const loan = await Ledger.checkLoan(tx, user.id, loan_id, LoanDirection.GIVEN, total_amount, new Date(transaction_date), bypass_warnings);

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
      log_type: 'RECEIVE_REPAYMENT',
      lines: [
        ...destination_lines,
        ...charge_line,
        { ...receivables_account, total_amount, charge_amount: null, cashflow_direction: 'DECREASE' as const },
      ],
      repayments: [{ loan_id: loan.id, amount: total_amount }],
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_receive_repayment = { handler, schema: { body: schema } };