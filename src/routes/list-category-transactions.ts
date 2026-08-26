import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const params_schema = z.object({
  category_id: z.uuid("category_id must be a valid UUID"),
});

const query_schema = z.object({
  account_id: z.uuid("account_id must be a valid UUID").optional(),
  cursor: z.iso.datetime().optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>; Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();
  
  const { category_id } = request.params;
  const { account_id, cursor, limit } = request.query;

  const category = await this.prisma.category.findFirst({
    where: { id: category_id, user_id: user.id },
  });
  
  if (!category)
    throw APIError.custom({ status: 404, message: "This category does not exist" });

  const entries = await this.prisma.journalEntry.findMany({
    where: {
      category_id,
      account: { user_id: user.id, type: 'EXPENSE' },
      ...(account_id && {
        transaction_group: {
          journal_entries: { some: { account_id } },
        },
      }),
      ...(cursor && { trx_date: { lt: new Date(cursor) } }),
    },
    orderBy: { trx_date: 'desc' },
    take: limit + 1,
    include: {
      account: { select: { name: true } },
      transaction_group: {
        include: {
          journal_entries: {
            where: { account: { type: { not: 'EXPENSE' } } },
            include: { account: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });

  const has_next = entries.length > limit;
  const page_entries = entries.slice(0, limit);
  
  const next_cursor = has_next
    ? page_entries[page_entries.length - 1]!.trx_date
    : null;

  return reply.code(200).send({
    category_id: category.id,
    category_name: category.name,
    entries: page_entries.map((e) => {
      const paying_entry = e.transaction_group.journal_entries[0]; // the non-Expense sibling
      return {
        id: e.id,
        amount: e.amount,
        trx_date: e.trx_date,
        description: e.description,
        account_id: paying_entry?.account.id ?? null,
        account_name: paying_entry?.account.name ?? null,
        transaction_group_id: e.transaction_group_id,
      };
    }),
    next_cursor,
    has_next,
  });
}

export const list_category_transactions = { handler, schema: { params: params_schema, querystring: query_schema } };