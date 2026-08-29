import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import Balances from "#/libs/balances.js";

const query_schema = z.object({
  account_id: z.uuid("account_id must be a valid UUID").optional(),
  start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { account_id, start_date, end_date } = request.query;
  const just_before_start = new Date(start_date.getTime() - 1);

  let accounts: { id: string; name: string; type: Prisma.AccountGetPayload<{}>['type'] }[];

  if (account_id) {
    const account = await this.prisma.account.findFirst({
      where: { id: account_id, user_id: user.id },
    });
    if (!account)
      throw APIError.custom({ status: 400, message: "This account does not exist" });
    accounts = [account];
  } else {
    accounts = await this.prisma.account.findMany({
      where: { user_id: user.id, type: 'ASSET' },
      select: { id: true, name: true, type: true },
    });
  }

  if (accounts.length === 0) {
    return reply.code(200).send({
      account_id: account_id ?? null,
      account_name: null,
      start_date, end_date,
      opening_balance: 0, closing_balance: 0, net_change: 0,
      total_in: 0, total_out: 0,
    });
  }

  const totals_by_account = await this.prisma.journalEntry.groupBy({
    by: ['account_id', 'side'],
    where: {
      account_id: { in: accounts.map((a) => a.id) },
      trx_date: { gte: start_date, lte: end_date },
    },
    _sum: { amount: true },
  });

  let opening_balance = 0, closing_balance = 0, total_in = 0, total_out = 0;

  await Promise.all(accounts.map(async (account) => {
    const [acc_opening, acc_closing] = await Promise.all([
      Balances.getBalanceAtDate(this.prisma, account.id, account.type, just_before_start),
      Balances.getBalanceAtDate(this.prisma, account.id, account.type, end_date),
    ]);
    opening_balance += acc_opening;
    closing_balance += acc_closing;

    const debit = Number(totals_by_account.find((t) => t.account_id === account.id && t.side === 'DEBIT')?._sum.amount ?? 0);
    const credit = Number(totals_by_account.find((t) => t.account_id === account.id && t.side === 'CREDIT')?._sum.amount ?? 0);
    const debit_is_in = Balances.resolveDelta(account.type, 'DEBIT', 1) > 0;

    total_in += debit_is_in ? debit : credit;
    total_out += debit_is_in ? credit : debit;
  }));

  return reply.code(200).send({
    account_id: account_id ?? null,
    account_name: accounts.length === 1 ? accounts[0]!.name : null,
    start_date,
    end_date,
    opening_balance,
    closing_balance,
    net_change: closing_balance - opening_balance,
    total_in, total_out,
  });
}

export const get_account_summary = { handler, schema: { querystring: query_schema } };