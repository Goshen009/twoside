import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

import Calc from "#/libs/calc.js";

const params_schema = z.object({
  loan_id: z.uuid("loan_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { loan_id } = request.params;

  const loan = await this.prisma.loan.findFirst({
    where: { id: loan_id, transaction_group: { user_id: user.id } },
    include: {
      counterparty: true,
      repayments: { 
      	orderBy: { date_repaid: 'asc' } 
      },
    },
  });

  if (!loan)
    throw APIError.custom({ status: 404, message: "This loan does not exist" });

  const total_repaid_cents = loan.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0);
  const remaining = Calc.toDecimalNumber(Calc.toWholeNumber(Number(loan.amount)) - total_repaid_cents);

  return reply.code(200).send({
    id: loan.id,
    direction: loan.direction,
    status: loan.status,
    amount: loan.amount,
    counterparty_id: loan.counterparty_id,
    counterparty_name: loan.counterparty.name,
    date_issued: loan.date_issued,
    remaining,
    repayments: loan.repayments.map((r) => ({
      id: r.id,
      amount: r.amount,
      date_repaid: r.date_repaid,
    })),
  });
}

export const get_loan = { handler, schema: { params: params_schema } };