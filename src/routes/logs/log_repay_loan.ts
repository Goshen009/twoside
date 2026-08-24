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
  sources: TransactionSchemas.accountAllocations("source"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, trx_date, loan_id, sources } = request.body;

  const loan = await Ledger.checkLoan(this.prisma, user.id, loan_id, LoanDirection.BORROWED);

  const total_amount = sources.reduce((sum, s) => sum + s.amount, 0);
  
  if (Calc.toWholeNumber(total_amount) > loan.remaining_cents)
    throw APIError.custom({ status: 400, message: `This payment exceeds what's left on this loan` });

  const source_lines = sources.map((s) => {
    const account = Ledger.checkAccount(s.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: `Loans can only be repaid from asset accounts` });
    
    return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
  });

  const payables_account = user.system_accounts.PAYABLES!;

  await this.prisma.$transaction(async (tx) => {
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      trx_date: new Date(trx_date),
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