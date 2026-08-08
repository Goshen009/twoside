import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const schema = z.object({
  status: z.enum(["OPEN", "PARTIALLY_REPAID", "CLOSED"]).optional(),
  direction: z.enum(["GIVEN", "BORROWED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { status, direction, page, limit } = request.query;

	const skip = (page - 1) * limit;
  const where: Prisma.LoanWhereInput = { 
	 	transaction_group: { user_id: user.id },
	  ...(status && { status }),
	  ...(direction && { direction })
  }

  const [loans, total] = await Promise.all([
 		this.prisma.loan.findMany({
     	where,
      orderBy: { date_issued: 'desc' },
      skip,
      take: limit,
      include: { 
     		counterparty: true,
       repayments: true
      },
   	}),
   	this.prisma.loan.count({ where })
  ]);

  const total_pages = Math.ceil(total / limit);

	return reply.code(200).send({
    loans: loans.map(l => ({
      id: l.id,
      direction: l.direction,
      status: l.status,
      amount: l.amount,
      counterparty_name: l.counterparty.name,
      date_issued: l.date_issued,
      total_repaid: l.repayments.reduce((sum, r) => sum + Number(r.amount), 0)
    })),
    pagination: {
    	total,
     	page,
     	limit,
     	total_pages,
     	has_next: page < total_pages,
     	has_prev: page > 1
    }
  });
}

export const list_loans = { handler, schema: { querystring: schema } };