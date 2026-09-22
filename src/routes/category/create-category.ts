import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const schema = z.object({
	category_name: z.string('Category name is required.').max(30, 'Category name cannot be more than 30 letters.').trim()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { category_name } = request.body;
  const lowercase = category_name.toLowerCase();

  try {
  	await this.prisma.category.create({
   		data: { 
     		user_id: user.id,
       	name: category_name,
        lowercase_name: lowercase
     	}
   	});
  } catch (err) {
	 	if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
	   	throw APIError.conflict("This category already exists.")
	  }
	  throw err;
  }
  
  return reply.code(200).send({ });
}

export const create_category = { handler, schema: { body: schema } };