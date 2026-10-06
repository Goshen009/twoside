import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const schema = z.object({
	tag_id: z.uuid()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { tag_id } = request.params;

  const deleted = await this.prisma.tag.deleteMany({
  	where: { id: tag_id, user_id: user.id }
  });

  if (deleted.count === 0) {
  	throw APIError.notFound("Tag not found");
  }

  return reply.code(200).send({});
}

export const delete_tag = { handler, schema: { params: schema } };