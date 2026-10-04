import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({

});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();

  return reply.code(200).send({});
}

export const transactions = { handler, schema: { querystring: schema } };