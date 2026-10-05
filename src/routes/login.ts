import { APIError } from "#/errors/APIError.js";
import Tokens from "#/libs/tokens.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	name: z.string()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const { name } = request.body;

  const user = await this.prisma.user.findUnique({
  	where: { name },
    include: { tags: true }
  });

  if (!user)
  	throw APIError.notFound("User not found");

  const access_token = Tokens.generateAccessToken(this.config, { id: user.id });

  return reply.code(200).send({ access_token, user });
}

export const login = { handler, schema: { body: schema } };