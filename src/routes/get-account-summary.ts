import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Balances from "#/libs/balances.js";

const query_schema = z.object({
  start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)),
});

const params_schema = z.object({
  account_id: z.uuid("account_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>; Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { account_id } = request.params;
  const { start_date, end_date } = request.query;

  const account = await this.prisma.account.findFirst({
    where: { id: account_id, user_id: user.id },
  });
  
  if (!account)
    throw APIError.custom({ status: 400, message: "This account does not exist" });

  const just_before_start = new Date(start_date.getTime() - 1);

  const [opening_balance, closing_balance, totals] = await Promise.all([
    Balances.getBalanceAtDate(this.prisma, account.id, account.type, just_before_start),
    Balances.getBalanceAtDate(this.prisma, account.id, account.type, end_date),
    this.prisma.journalEntry.groupBy({
      by: ['side'],
      where: { account_id, trx_date: { gte: start_date, lte: end_date } },
      _sum: { amount: true },
    })
  ]);

  const debit_total = Number(totals.find((t) => t.side === 'DEBIT')?._sum.amount ?? 0);
  const credit_total = Number(totals.find((t) => t.side === 'CREDIT')?._sum.amount ?? 0);
  
  const total_in = Balances.resolveDelta(account.type, 'DEBIT', 1) > 0 ? debit_total : credit_total;
  const total_out = Balances.resolveDelta(account.type, 'DEBIT', 1) > 0 ? credit_total : debit_total;

  return reply.code(200).send({
    account_id: account.id,
    account_name: account.name,
    start_date,
    end_date,
    opening_balance,
    closing_balance,
    net_change: closing_balance - opening_balance,
    total_in,
    total_out,
  });
}

export const get_account_summary = { handler, schema: { params: params_schema, querystring: query_schema } };