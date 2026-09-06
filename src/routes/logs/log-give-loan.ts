import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Ledger from "#/libs/ledger.js";
import Domain from "#/libs/domain.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
  ...TransactionSchemas.commonFields(),
  counterparty_name: z.string("Counterparty name must be a string").trim().min(1, "Counterparty name must not be empty").max(100, "Counterparty name must not be more than 100 letters"),
  sources: TransactionSchemas.accountAllocations("source"),
  bypass_warnings: TransactionSchemas.bypassWarnings(['INSUFFICIENT_BALANCE']),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, counterparty_name, sources, bypass_warnings } = request.body;

  const source_lines = sources.map(s => {
  	const account = Ledger.checkAccount(s.account_id, user.accounts);
  	if (account.type !== 'ASSET')
   		throw APIError.custom({ status: 400, message: "Loans can only be given from asset accounts" });
   
   	return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
  });

  const total_amount = Calc.toDecimalNumber(sources.reduce((sum, s) => sum + Calc.toWholeNumber(s.amount), 0));
  const receivables_account = user.system_accounts.RECEIVABLES!;

  await this.prisma.$transaction(async (tx) => {
  	if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
   		await Ledger.checkSufficientBalance(tx, source_lines, new Date(transaction_date), user.currency_symbol);
   	}
  
 		const resolved_counterparty_id = await Domain.enableOrCreateCounterparty(tx, user.id, counterparty_name)
  
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      transaction_date: new Date(transaction_date),
      log_type: 'GIVE_LOAN',
      lines: [
        ...source_lines,
        { ...receivables_account, amount: total_amount, cashflow_direction: 'INCREASE' as const },
      ],
      loan: { direction: 'GIVEN', counterparty_id: resolved_counterparty_id, amount: total_amount },
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_give_loan = { handler, schema: { body: schema } };