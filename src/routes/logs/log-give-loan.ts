import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import TransactionSchemas from "#/libs/transaction-schemas.js";
import Balances from "#/libs/balances.js";
import Ledger from "#/libs/ledger.js";
import Calc from "#/libs/calc.js";

const schema = z.object({
  ...TransactionSchemas.commonFields(),
  counterparty_id: z.uuid("counterparty_id is required and must be a valid UUID"),
  sources: TransactionSchemas.accountAllocations("source"),
  bypass_warnings: TransactionSchemas.bypassWarnings(['INSUFFICIENT_BALANCE']),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, counterparty_id, sources, bypass_warnings } = request.body;

  const counterparty = await Ledger.checkCounterparty(this.prisma, user.id, counterparty_id);

  const source_lines = await Promise.all(
 		sources.map(async (s) => {
 			const account = Ledger.checkAccount(s.account_id, user.accounts);
    	if (account.type !== 'ASSET')
     		throw APIError.custom({ status: 400, message: "Loans can only be given from asset accounts" });

    	if (!bypass_warnings.includes("INSUFFICIENT_BALANCE")) {
	     	const balance_in_account = await Balances.getBalanceAtDate(this.prisma, account.id, account.type, new Date(transaction_date));
				if (Calc.toWholeNumber(balance_in_account) < Calc.toWholeNumber(s.amount))
					throw APIError.warning("INSUFFICIENT_BALANCE", `${account.name} only has ${balance_in_account.toFixed(2)}, but ${s.amount.toFixed(2)} was requested.`);
      }
      
     	return { ...account, amount: s.amount, cashflow_direction: 'DECREASE' as const };
   	})
  );

  const total_amount = sources.reduce((sum, s) => sum + s.amount, 0);
  const receivables_account = user.system_accounts.RECEIVABLES!;

  await this.prisma.$transaction(async (tx) => {
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      transaction_date: new Date(transaction_date),
      log_type: 'GIVE_LOAN',
      lines: [
        ...source_lines,
        { ...receivables_account, amount: total_amount, cashflow_direction: 'INCREASE' as const },
      ],
      loan: { direction: 'GIVEN', counterparty_id: counterparty.id, amount: total_amount },
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_give_loan = { handler, schema: { body: schema } };