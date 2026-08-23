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

  let account;
  try {
    account = await this.prisma.account.create({
      data: {
        name,
        type: 'ASSET',
        system_role: null,
        user_id: user.id,
        balance_snapshots: {
          create: [{ balance: 0, as_of_date: new Date() }],
        },
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw APIError.validationError([{ field: 'account', message: 'This name has been used by another account.' }]);
    }
    throw err;
  }

  return reply.code(200).send({ id: account.id });
}

export const create_account = { handler, schema: { body: schema } };