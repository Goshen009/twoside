import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";

const schema = z.object({
  loan_id: z.uuid("loan_id must be a valid UUID").optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  direction: z.enum(["GIVEN", "BORROWED"]).optional(),
  counterparty_id: z.uuid("counterparty_id must be a valid UUID").optional(),
  cursor: z.iso.datetime("cursor must be a valid ISO datetime").transform((val) => new Date(val)).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { loan_id, status, direction, counterparty_id, cursor, limit } = request.query;

  const where: Prisma.LoanWhereInput = {
    transaction_group: { user_id: user.id },
    ...(loan_id && { id: loan_id }),
    ...(status === "OPEN" && { status: { in: ["OPEN", "PARTIALLY_REPAID"] } }),
    ...(status === "CLOSED" && { status: "CLOSED" }),
    ...(direction && { direction }),
    ...(counterparty_id && { counterparty_id }),
    ...(cursor && { date_issued: { lt: cursor } }),
  };

  const loans = await this.prisma.loan.findMany({
    where,
    take: limit + 1,
    orderBy: { date_issued: 'desc' },
    include: {
      counterparty: true,
      transaction_group: {
        include: {
          journal_entries: {
            where: { account: { system_role: null } },
            select: { description: true },
          },
        },
      },
      repayments: {
        orderBy: { date_repaid: 'asc' },
        include: {
          transaction_group: {
            include: {
              journal_entries: {
                where: { account: { system_role: null } },
                select: { description: true, account: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });

  const has_next = loans.length > limit;
  const page_loans = loans.slice(0, limit);
  const next_cursor = has_next ? page_loans[page_loans.length - 1]!.date_issued : null;

  return reply.code(200).send({
    loans: page_loans.map((l) => {
      const total_repaid_cents = l.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0);
      const remaining = Calc.toDecimalNumber(Calc.toWholeNumber(Number(l.amount)) - total_repaid_cents);

      return {
        id: l.id,
        direction: l.direction,
        status: l.status,
        amount: Number(l.amount),
        description: l.transaction_group.journal_entries[0]?.description ?? null,
        counterparty_id: l.counterparty_id,
        counterparty_name: l.counterparty.name,
        date_issued: l.date_issued,
        remaining,
        total_repaid: Calc.toDecimalNumber(total_repaid_cents),
        repayments: l.repayments.map((r) => {
          const line = r.transaction_group.journal_entries[0];
          return {
            id: r.id,
            amount: Number(r.amount),
            date_repaid: r.date_repaid,
            description: line?.description ?? null,
            account: line?.account ?? null,
          };
        }),
      };
    }),
    next_cursor,
    has_next,
  });
}

export const list_loans = { handler, schema: { querystring: schema } };