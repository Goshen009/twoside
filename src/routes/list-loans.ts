import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";

const schema = z.object({
  status: z.enum(["OPEN", "PARTIALLY_REPAID", "CLOSED"]).optional(),
  direction: z.enum(["GIVEN", "BORROWED"]).optional(),
  cursor: z.iso.datetime("cursor must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { status, direction, cursor, limit } = request.query;

  const where: Prisma.LoanWhereInput = {
    transaction_group: { user_id: user.id },
    ...(status && { status }),
    ...(direction && { direction }),
    ...(cursor && { date_issued: { lt: cursor } }),
  };

  const loans = await this.prisma.loan.findMany({
    where,
    take: limit + 1,
    orderBy: { date_issued: 'desc' },
    include: { 
    	counterparty: true,
     	repayments: true
    },
  });

  const has_next = loans.length > limit;
  const page_loans = loans.slice(0, limit);
  
  const next_cursor = has_next
    ? page_loans[page_loans.length - 1]!.date_issued
    : null;

  return reply.code(200).send({
    loans: page_loans.map((l) => ({
      id: l.id,
      direction: l.direction,
      status: l.status,
      amount: l.amount,
      counterparty_name: l.counterparty.name,
      date_issued: l.date_issued,
      total_repaid: Calc.toDecimalNumber(l.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0)),
    })),
    next_cursor,
    has_next,
  });
}

export const list_loans = { handler, schema: { querystring: schema } };