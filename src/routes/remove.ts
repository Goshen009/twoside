import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const schema = z.object({
	transaction_id: z.uuid()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { transaction_id } = request.params;

  // entries first (FK to transaction), then the transaction, all or nothing
  const [, deleted] = await this.prisma.$transaction([
    this.prisma.entries.deleteMany({
      where: { transaction_id, transaction: { user_id: user.id } }
    }),
    this.prisma.transaction.deleteMany({
      where: { id: transaction_id, user_id: user.id }
    })
  ]);

  if (deleted.count === 0) {
    return reply.code(404).send({ error: "Transaction not found" });
  }

  return reply.code(200).send({});
}

export const remove = { handler, schema: { params: schema } };