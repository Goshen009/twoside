import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const schema = z.object({
  name: z.string("name must be a string").min(1, "name is required").max(100, "name must not be more than 100 characters"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { name } = request.body;

  let counterparty;
  try {
  	counterparty = await this.prisma.counterparty.create({
   		data: {
     		name,
       	user_id: user.id
     	}
   	});
  } catch (err) {
 		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
   		throw APIError.validationError([{ field: 'counterparty', message: 'This name has been used for another counterparty.' }]);
    }
    throw err;
  }

  return reply.code(200).send({ id: counterparty.id });
}

export const create_counterparty = { handler, schema: { body: schema } };