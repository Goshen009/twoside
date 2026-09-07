import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

const query_schema = z.object({
	cursor: z.string()
	  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_[0-9a-fA-F-]{36}$/, "cursor is malformed")
	  .transform((val) => {
	    const [transaction_date_str, posted_at_str, id] = val.split("_");
	    return { transaction_date: new Date(transaction_date_str!), posted_at: new Date(posted_at_str!), id: id! };
	  })
	  .optional(),
	limit: z.coerce.number().int().positive().max(100).default(25),
	account_id: z.uuid("account_id must be a valid UUID").optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { cursor, limit, account_id } = request.query;

  if (account_id && !user.accounts.find(a => a.id === account_id))
  	throw APIError.notFound("This account does not exist.")

  const where: Prisma.JournalEntryWhereInput = {
  	transaction_group: { user_id: user.id },
   	account: { system_role: null },
    ...(account_id && { account_id }),
    ...(cursor && {
      OR: [
        { transaction_date: { lt: cursor.transaction_date } },
        { transaction_date: cursor.transaction_date, posted_at: { lt: cursor.posted_at } },
        { transaction_date: cursor.transaction_date, posted_at: cursor.posted_at, id: { lt: cursor.id } },
      ],
    }),
  };

  const entries = await this.prisma.journalEntry.findMany({
  	where,
   	take: limit + 1,
    orderBy: [{ transaction_date: 'desc' }, { posted_at: 'desc' }, { id: 'desc' }],
    include: {
    
    }
  });

  const has_next = entries.length > limit;
  const page_entries = entries.slice(0, limit);

  const last = page_entries[page_entries.length - 1];
  const next_cursor = has_next
    ? `${last!.transaction_date.toISOString()}_${last!.posted_at.toISOString()}_${last!.id}`
    : null;

  return reply.code(200).send({
  	next_cursor,
   	has_next,
    entries: { }
  });
}

export const get_transactions = { handler, schema: { querystring: query_schema } };