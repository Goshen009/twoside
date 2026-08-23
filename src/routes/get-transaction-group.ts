import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const params_schema = z.object({
  group_id: z.uuid("group_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  const { group_id } = request.params;

  const group = await this.prisma.transactionGroup.findFirst({
    where: { id: group_id, user_id: user.id },
    include: {
      journal_entries: {
        include: { account: true, category: true },
        orderBy: { side: 'asc' },
      },
    },
  });

  if (!group)
    throw APIError.custom({ status: 404, message: "This transaction group does not exist" });

  return reply.code(200).send({
    id: group.id,
    trx_date: group.journal_entries[0]?.trx_date,
    description: group.journal_entries[0]?.description,
    entries: group.journal_entries.map((e) => ({
      id: e.id,
      side: e.side,
      amount: e.amount,
      account_id: e.account_id,
      account_name: e.account.name,
      category_id: e.category_id,
      category_name: e.category?.name ?? null,
    })),
  });
}

export const get_transaction_group = { handler, schema: { params: params_schema } };