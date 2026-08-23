import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";

const params_schema = z.object({
  counterparty_id: z.uuid("counterparty_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { counterparty_id } = request.params;

  const counterparty = await this.prisma.counterparty.findFirst({
    where: { id: counterparty_id, user_id: user.id },
  });
  
  if (!counterparty)
    throw APIError.custom({ status: 404, message: "This counterparty does not exist" });

  const loans = await this.prisma.loan.findMany({
    where: { 
    	counterparty_id,
     	transaction_group: { user_id: user.id }
    },
    orderBy: { date_issued: 'desc' },
    include: { repayments: true },
  });

  const summarized = loans.map((l) => {
    const total_repaid_cents = l.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0);
    const remaining = Calc.toDecimalNumber(Calc.toWholeNumber(Number(l.amount)) - total_repaid_cents);
    return {
      id: l.id,
      direction: l.direction,
      status: l.status,
      amount: Number(l.amount),
      date_issued: l.date_issued,
      total_repaid: Calc.toDecimalNumber(total_repaid_cents),
      remaining,
    };
  });

  const owed_to_you = summarized
    .filter((l) => l.direction === 'GIVEN')
    .reduce((sum, l) => sum + Calc.toWholeNumber(l.remaining), 0);

  const you_owe = summarized
    .filter((l) => l.direction === 'BORROWED')
    .reduce((sum, l) => sum + Calc.toWholeNumber(l.remaining), 0);

  return reply.code(200).send({
    counterparty_id: counterparty.id,
    counterparty_name: counterparty.name,
    owed_to_you: Calc.toDecimalNumber(owed_to_you),
    you_owe: Calc.toDecimalNumber(you_owe),
    loans: summarized,
  });
}

export const get_counterparty_loans = { handler, schema: { params: params_schema } };