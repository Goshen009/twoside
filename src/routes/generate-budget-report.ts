import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Calc } from "#/libs/index.js";
import { z } from "zod/v4";

const schema = z.object({
	category_id: z.uuid("category_id must be a valid UUID"),
	start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { category_id, start_date, end_date } = request.query;

  const category = await this.prisma.category.findFirst({
  	where: { id: category_id, user_id: user.id }
  });

  if (!category)
  	throw APIError.custom({ status: 400, message: "This category does not exist" });

  // "just before start_date" so start_date's own activity isn't double-counted
  // between balance_before and the within-window totals
  const just_before_start = new Date(start_date.getTime() - 1);
  
  const [before, end] = await Promise.all([
    Calc.get_budget_snapshot_totals(category_id, just_before_start, this.prisma),
    Calc.get_budget_snapshot_totals(category_id, end_date, this.prisma),
  ]);

  const balance_before = before.total_allocated - before.total_spent;
  
  const allocated_within = end.total_allocated - before.total_allocated;
  const spent_within = end.total_spent - before.total_spent;
  
  const remaining = balance_before + allocated_within - spent_within;
  
  return reply.code(200).send({
    category_id,
    category_name: category.name,
    is_category_disabled: category.is_disabled,
    balance_before,
    allocated_within,
    spent_within,
    remaining
  });
}

export const generate_budget_report = { handler, schema: { querystring: schema } };