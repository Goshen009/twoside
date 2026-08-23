import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";
import { Prisma } from "#/prisma/client.js";

const query_schema = z.object({
  cursor: z.iso.datetime("cursor must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)).optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
});

const params_schema = z.object({
	account_id: z.uuid("account_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof params_schema>, Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { account_id } = request.params;
  const { cursor, limit } = request.query;

  const account = await this.prisma.account.findFirst({
    where: { id: account_id, user_id: user.id }
  });
  
  if (!account)
    throw APIError.custom({ status: 400, message: "This account does not exist" });

  const where: Prisma.JournalEntryWhereInput = {
  	account_id,
   	...(cursor && { trx_date: { lt: cursor } }),
  }
  
  const entries = await this.prisma.journalEntry.findMany({
    where,
    take: limit + 1, // fetch one extra to know if there's a next page
    orderBy: { trx_date: 'desc' },
    include: { 
    	category: { 
     		select: { name: true, is_active: true } 
     	}
    },
  });

  const has_next = entries.length > limit;
  const page_entries = entries.slice(0, limit);
  
  const next_cursor = has_next 
  	? page_entries[page_entries.length - 1]!.trx_date
   	: null;

  return reply.code(200).send({
    account_id: account.id,
    account_name: account.name,
    is_active: account.is_active,
    entries: page_entries.map((e) => ({
    	id: e.id,
    	side: e.side,
      amount: e.amount,
      trx_date: e.trx_date,
      date_logged: e.created_at,
      description: e.description,
      category_id: e.category_id,
      category_name: e.category?.name ?? null,
      is_category_active: e.category?.is_active ?? null,
      transaction_group_id: e.transaction_group_id
    })),
    next_cursor,
    has_next,
  });
}

export const list_transactions = { handler, schema: { params: params_schema, querystring: query_schema } };