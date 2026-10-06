import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const params_schema = z.object({
	tag_id: z.uuid(),
});

const body_schema = z.object({
	tag: z.string().trim().min(1).max(50, "Tag name cannot be more than 50 letters")
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>, Body: z.infer<typeof body_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { tag } = request.body;
  const { tag_id } = request.params;

  try {
  	await this.prisma.tag.update({
   		where: { id: tag_id, user_id: user.id },
     	data: { name: tag, lowercase_name: tag.toLowerCase() }
   	});
  } catch (err) {
   	if (err instanceof Prisma.PrismaClientKnownRequestError) {
    	if (err.code === 'P2025')
    		throw APIError.notFound("Tag not found");
     	if (err.code === 'P2002')
      	throw APIError.conflict("This name is already in use.")
    }
   	throw err;
  }
  
  return reply.code(200).send({});
}

export const edit_tag = { handler, schema: { params: params_schema, body: body_schema } };