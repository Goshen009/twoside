import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const params_schema = z.object({
  account_id: z.uuid("account_id is required and must be a valid UUID"),
});

const body_schema = z.object({
  is_active: z.boolean("is_active is required and must be a boolean"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>; Body: z.infer<typeof body_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { account_id } = request.params;
  const { is_active } = request.body;

  try {
    await this.prisma.account.update({
      where: { id: account_id, user_id: user.id, system_role: null },
      data: { is_active },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw APIError.custom({ status: 404, message: "This account does not exist" });
    }
    throw err;
  }

  return reply.code(200).send({ message: "Successful" });
}

export const toggle_account_status = { handler, schema: { params: params_schema, body: body_schema } };