import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const params_schema = z.object({
	tag_id: z.uuid()
});

const body_schema = z.object({
	target_tag_id: z.uuid()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>, Body: z.infer<typeof body_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { target_tag_id } = request.body;
  const { tag_id: source_tag_id } = request.params;

  if (target_tag_id === source_tag_id)
  	throw APIError.validationError([{ field: 'target_tag_id', message: "You cannot merge the same tag." }])

  try {
	 	await this.prisma.$transaction(async (tx) => {
	    const result = await tx.transaction.updateMany({
	      where: { user_id: user.id, tag_id: source_tag_id },
	      data: { tag_id: target_tag_id },
	    });
	  
	    if (result.count === 0)
	      throw APIError.notFound("Source tag not found.");
	  
	    await tx.tag.deleteMany({
	      where: { user_id: user.id, id: source_tag_id },
	    });
	  });
  } catch (err) {
  	if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
   		throw APIError.conflict("Target tag not found");
   	}
   	throw err;
  }

  return reply.code(200).send({});
}

export const merge_tag = { handler, schema: { params: params_schema, body: body_schema } };