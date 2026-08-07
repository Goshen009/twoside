import { APIError } from "#/errors/APIError.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	amount: z.number("amount is required and must be a number").multipleOf(0.01),
	description: z.string("description is required and must be a string").max(100, "description must not be more than 100 characters"),
	date_allocated: z.iso.datetime("date_allocated is required and must be in the format 2020-01-01T00:00:00"),
	category_id: z.uuid("category_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { amount, description, date_allocated, category_id } = request.body;

  const category = await this.prisma.category.findFirst({
  	where: { id: category_id, user_id: user.id }
  });

  if (!category)
  	throw APIError.custom({ status: 400, message: "This category does not exist" });

  await this.prisma.$transaction(async (tx) => {
  	await tx.budgetAllocation.create({
 			data: {
  			amount,
    		description,
     		date_allocated,
      	category_id,
      	user_id: user.id,
    	}
   	});

	  // now we re-calculate the budget snapshot (if need be)
	  const latest_snapshot = await tx.budgetSnapshot.findFirst({
	   	where: { category_id },
	    orderBy: { as_of_date: 'desc' }
	  });
	
		if (latest_snapshot && new Date(date_allocated) <= latest_snapshot.as_of_date) {
			await tx.budgetSnapshot.updateMany({
				where: { category_id, as_of_date: { gte: new Date(date_allocated) } },
				data: {
					total_allocated: { increment: amount }
				}
			});
	  }
  });
  
  return reply.code(200).send({ message: "Budget allocated!" });
}

export const allocate_budget = { handler, schema: { body: schema } };