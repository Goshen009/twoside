import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const query_schema = z.object({
	start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

const path_schema = z.object({
	category_id: z.uuid("category_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof path_schema>, Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { category_id } = request.params;
  const { start_date, end_date, page, limit } = request.query;

  const category = await this.prisma.category.findFirst({
    where: { id: category_id, user_id: user.id }
  });

  if (!category)
    throw APIError.custom({ status: 400, message: "This category does not exist" });
  
  const skip = (page - 1) * limit;
  const where: Prisma.BudgetAllocationWhereInput = { 
  	category_id, 
   	date_allocated: { gte: start_date, lte: end_date }
  };

  const [allocations, total] = await Promise.all([
    this.prisma.budgetAllocation.findMany({
      where,
      orderBy: { date_allocated: 'asc' },
      skip,
      take: limit
    }),
    this.prisma.budgetAllocation.count({ where })
  ]);
  
  const total_pages = Math.ceil(total / limit);

  return reply.code(200).send({
	 	category_id: category.id,
	  category_name: category.name,
	  is_category_disabled: category.is_disabled,
 		allocations: allocations.map(a => ({
   		id: a.id,
     	amount: a.amount,
      description: a.description,
      date_allocated: a.date_allocated,
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

export const fetch_allocations = { handler, schema: { params: path_schema, querystring: query_schema } };