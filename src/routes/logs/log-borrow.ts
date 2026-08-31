import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Ledger from "#/libs/ledger.js";
import TransactionSchemas from "#/libs/transaction-schemas.js";

const schema = z.object({
  ...TransactionSchemas.commonFields(),
  counterparty_id: z.uuid("counterparty_id is required and must be a valid UUID"),
  destinations: TransactionSchemas.accountAllocations("destination"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { description, transaction_date, counterparty_id, destinations } = request.body;

  const counterparty = await Ledger.checkCounterparty(this.prisma, user.id, counterparty_id);

  const destination_lines = destinations.map((d) => {
    const account = Ledger.checkAccount(d.account_id, user.accounts);
    if (account.type !== 'ASSET')
      throw APIError.custom({ status: 400, message: `Borrowed money can only be received into asset accounts` });

    return { ...account, amount: d.amount, cashflow_direction: 'INCREASE' as const };
  });

  const total_amount = destinations.reduce((sum, d) => sum + d.amount, 0);
  const payables_account = user.system_accounts.PAYABLES!;

  await this.prisma.$transaction(async (tx) => {
    await Ledger.logTransaction(tx, {
      user_id: user.id,
      description,
      transaction_date: new Date(transaction_date),
      log_type: 'BORROW',
      lines: [
        ...destination_lines,
        { ...payables_account, amount: total_amount, cashflow_direction: 'INCREASE' as const },
      ],
      loan: { direction: 'BORROWED', counterparty_id: counterparty.id, amount: total_amount },
    });
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_borrow = { handler, schema: { body: schema } };