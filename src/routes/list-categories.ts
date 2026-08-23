import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
  show_inactive: z.enum(["true", "false"]).default("false").transform(v => v === "true")
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { show_inactive } = request.query;

	const categories = await this.prisma.category.findMany({
		where: { 
			user_id: user.id,
			...(!show_inactive && { is_active: true })
	 	}
	});
  
  return reply.code(200).send({
  	categories: categories.map(c => ({
   		id: c.id,
    	name: c.name,
     	is_active: c.is_active
   	}))
  });
}

export const list_categories = { handler, schema: { querystring: schema } };