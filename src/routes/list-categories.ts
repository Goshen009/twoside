import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	show_disabled: z.boolean().default(false)
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { show_disabled } = request.query;

	const categories = await this.prisma.category.findMany({
		where: { 
			user_id: user.id,
			...(!show_disabled && { is_disabled: false } )
	 	}
	});
  
  return reply.code(200).send({
  	categories: categories.map(c => ({
   		id: c.id,
    	name: c.name,
   	}))
  });
}

export const list_categories = { handler, schema: { querystring: schema } };