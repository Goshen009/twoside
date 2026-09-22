import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import { APIError } from "#/errors/APIError.js";

const params_schema = z.object({
	category_id: z.uuid("ID is not a valid UUID")
});

const body_schema = z.object({
	category_name: z.string('Category name is required.').max(30, 'Category name cannot be more than 30 letters.').trim(),
	set_active: z.enum(["true", "false"], "Set active must be true or false").transform(v => v === 'true')
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>, Body: z.infer<typeof body_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { category_id } = request.params;
  const { category_name, set_active } = request.body;
  
  const lowercase = category_name.toLowerCase();

  try {
  	await this.prisma.category.update({
   		where: { id: category_id, user_id: user.id },
     	data: { 
      	name: category_name,
       	lowercase_name: lowercase,
        is_active: set_active
      }
   	});
  } catch (err) {
  	if (err instanceof Prisma.PrismaClientKnownRequestError) {
   		if (err.code === 'P2025') throw APIError.notFound("This category was not found");
     	if (err.code === 'P2002') throw APIError.conflict("There's another category with this name");
   	}
		throw err;
  }
  
  return reply.code(200).send({});
}

export const edit_category = { handler, schema: { params: params_schema, body: body_schema } };