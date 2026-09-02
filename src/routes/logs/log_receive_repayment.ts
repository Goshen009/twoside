import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { LoanDirection } from "#/prisma/client.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";
import Ledger from "#/libs/ledger.js";
import TransactionSchemas from "#/libs/transaction-schemas.js";

const schema = z.object({
	...TransactionSchemas.commonFields(),
	loan_id: z.uuid("loan_id is required and must be a valid UUID"),
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

  const loan = await Ledger.checkLoan(this.prisma, user.id, loan_id, LoanDirection.GIVEN);

  if (!bypass_warnings.includes("REPAYMENT_DATED_BEFORE")) {
 		if (new Date(transaction_date) < loan.date_issued)
   		throw APIError.warning("REPAYMENT_DATED_BEFORE", TransactionSchemas.repaymentDatedBeforeMessage(loan.date_issued));
  }

  const total_amount = destinations.reduce((sum, d) => sum + d.amount, 0);
  
  if (Calc.toWholeNumber(total_amount) > loan.remaining_cents)
    throw APIError.custom({ status: 400, message: `This payment exceeds what's left on this loan` });

  const destination_lines = destinations.map((d) => {
    const account = Ledger.checkAccount(d.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: `Repayments can only be received into asset accounts` });

    return { ...account, amount: d.amount, cashflow_direction: 'INCREASE' as const };
  });

  const receivables_account = user.system_accounts.RECEIVABLES!;

  await this.prisma.$transaction(async (tx) => {
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      transaction_date: new Date(transaction_date),
      log_type: 'RECEIVE_REPAYMENT',
      lines: [
        ...destination_lines,
        { ...receivables_account, amount: total_amount, cashflow_direction: 'DECREASE' as const },
      ],
      repayments: [{ loan_id: loan.id, amount: total_amount }],
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_receive_repayment = { handler, schema: { body: schema } };