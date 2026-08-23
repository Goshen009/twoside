import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const params_schema = z.object({
  category_id: z.uuid("category_id must be a valid UUID"),
});

const query_schema = z.object({
  start_date: z.iso.date().transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date().transform((val) => new Date(`${val}T23:59:59.999Z`)),
  account_id: z.uuid("account_id must be a valid UUID").optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>; Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { category_id } = request.params;
  const { start_date, end_date, account_id } = request.query;

  const category = await this.prisma.category.findFirst({
    where: { id: category_id, user_id: user.id },
  });
  
  if (!category)
    throw APIError.custom({ status: 404, message: "This category does not exist" });

  if (account_id) {
  	const account = user.accounts.find(a => a.id === account_id);
  
    if (!account)
      throw APIError.custom({ status: 400, message: "This account does not exist" });
  }

  const total = await this.prisma.journalEntry.aggregate({
    where: {
      category_id,
      trx_date: { gte: start_date, lte: end_date },
      account: { 
      	user_id: user.id,
       	...(account_id && { id: account_id })
      },
    },
    _sum: { amount: true },
  });

  return reply.code(200).send({
    category_id: category.id,
    category_name: category.name,
    start_date,
    end_date,
    scoped_to_account_id: account_id ?? null,
    total_spent: Number(total._sum.amount ?? 0),
  });
}

export const get_category_summary = { handler, schema: { params: params_schema, querystring: query_schema } };