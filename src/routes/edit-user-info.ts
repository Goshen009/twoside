import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	name: z.string().trim().min(1, "Name is requred").max(50, "Name cannot be more than 50 letters").optional()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { name } = request.body;

  await this.prisma.user.update({
  	where: { id: user.id },
  	data: { 
   		name
   	}
  });

  return reply.code(200).send({});
}

export const edit_user_info = { handler, schema: { body: schema } };