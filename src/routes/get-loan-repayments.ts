import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const params_schema = z.object({
  repayment_id: z.uuid("repayment_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { repayment_id } = request.params;

  const repayment = await this.prisma.loanRepayment.findFirst({
    where: { id: repayment_id, loan: { transaction_group: { user_id: user.id } } },
    include: {
      loan: {
        include: {
          counterparty: true,
          repayments: { orderBy: { date_repaid: 'asc' } },
        },
      },
    },
  });

  if (!repayment)
    throw APIError.custom({ status: 404, message: "This repayment does not exist" });

  return reply.code(200).send({
    id: repayment.id,
    amount: repayment.amount,
    date_repaid: repayment.date_repaid,
    loan: {
      id: repayment.loan.id,
      direction: repayment.loan.direction,
      status: repayment.loan.status,
      amount: repayment.loan.amount,
      counterparty_name: repayment.loan.counterparty.name,
      date_issued: repayment.loan.date_issued,
    },
    sibling_repayments: repayment.loan.repayments.map((r) => ({
      id: r.id,
      amount: r.amount,
      date_repaid: r.date_repaid,
    })),
  });
}

export const get_loan_repayment = { handler, schema: { params: params_schema } };