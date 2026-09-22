import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

import { APIError } from "#/errors/APIError.js";

const params_schema = z.object({
	counterparty_id: z.uuid("ID is not a valid UUID")
});

const body_schema = z.object({
	counterparty_name: z.string('Counterpary name is required.').max(30, 'Counterpary name cannot be more than 30 letters.').trim(),
	set_active: z.enum(["true", "false"], "Set active must be true or false").transform(v => v === 'true')
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>, Body: z.infer<typeof body_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { counterparty_id } = request.params;
  const { counterparty_name, set_active } = request.body;
  
  const lowercase = counterparty_name.toLowerCase();

  try {
  	await this.prisma.counterparty.update({
   		where: { id: counterparty_id, user_id: user.id },
     	data: { 
      	name: counterparty_name,
       	lowercase_name: lowercase,
        is_active: set_active
      }
   	});
  } catch (err) {
  	if (err instanceof Prisma.PrismaClientKnownRequestError) {
   		if (err.code === 'P2025') throw APIError.notFound("This counterparty was not found");
    	if (err.code === 'P2002') throw APIError.conflict("There's another counterparty with this name");
   	}
		throw err;
  }
  
  return reply.code(200).send({});
}

export const edit_counterparty = { handler, schema: { params: params_schema, body: body_schema } };