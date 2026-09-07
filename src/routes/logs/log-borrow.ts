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
  destinations: TransactionSchemas.accountAllocations("destination"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, counterparty_name, destinations } = request.body;

  const destination_lines = destinations.map((d) => {
    const account = Ledger.checkAccount(d.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: `Borrowed money can only be received into asset accounts` });

    const net_amount = Calc.toDecimalNumber(Calc.toWholeNumber(d.amount) - Calc.toWholeNumber(d.charge));
    return { ...account, total_amount: net_amount, charge_amount: d.charge || null, cashflow_direction: 'INCREASE' as const };
  });

  const total_amount = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.amount), 0));
  const total_charges = Calc.toDecimalNumber(destinations.reduce((sum, d) => sum + Calc.toWholeNumber(d.charge), 0));

  const payables_account = user.system_accounts.PAYABLES!;
  const expense_account = user.system_accounts.EXPENSE!;

  await this.prisma.$transaction(async (tx) => {
  	const resolved_counterparty_id = await Domain.enableOrCreateCounterparty(tx, user.id, counterparty_name)

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
      log_type: 'BORROW',
      lines: [
        ...destination_lines,
        ...charge_line,
        { ...payables_account, total_amount, charge_amount: null, cashflow_direction: 'INCREASE' as const },
      ],
      loan: { direction: 'BORROWED', counterparty_id: resolved_counterparty_id, amount: total_amount },
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_borrow = { handler, schema: { body: schema } };