import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const query_schema = z.object({
	cursor: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_[0-9a-fA-F-]{36}$/, "cursor is malformed")
    .transform((val) => {
      const [date_str, id] = val.split("_");
      return { trx_date: new Date(date_str!), id: id! };
    })
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  category_id: z.uuid("category_id must be a valid UUID").optional(),
  account_id: z.uuid("account_id must be a valid UUID").optional(),
  start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)).optional(),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)).optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { cursor, limit, category_id, account_id, start_date, end_date } = request.query;

  if (account_id) {
	 	const account = await this.prisma.account.findFirst({
	    where: { id: account_id, user_id: user.id }
	  });
	  
	  if (!account)
	    throw APIError.custom({ status: 400, message: "This account does not exist" });
  }

  const where: Prisma.JournalEntryWhereInput = {
    transaction_group: { user_id: user.id },
    ...(account_id && { account_id }),
    ...(category_id && { category_id }),
    AND: [
      ...(start_date || end_date
        ? [{
            trx_date: {
              ...(start_date && { gte: start_date }),
              ...(end_date && { lte: end_date }),
            },
          }]
        : []),
      ...(cursor
        ? [{
            OR: [
              { trx_date: { lt: cursor.trx_date } },
              { trx_date: cursor.trx_date, id: { lt: cursor.id } },
            ],
          }]
        : []),
    ],
  };
  
  const entries = await this.prisma.journalEntry.findMany({
    where,
    take: limit + 1, // fetch one extra to know if there's a next page
    orderBy: [{ trx_date: 'desc' }, { id: 'desc' }],
    include: { 
    	category: { 
     		select: { name: true, is_active: true } 
     	},
      account: {
      	select: { id: true, name: true, is_active: true }
      },
      transaction_group: {
     		select: {
     			journal_entries: {
      			select: {
         			side: true,
            	amount: true,
            	account: { select: { id: true, name: true } }
         		}
        	},
         	loans: {
          	select: {
        			counterparty: {
        				select: {
            			id: true,
               		name: true,
            		}
           		}
           	}
          }
       	}
      }
    },
  });

  const has_next = entries.length > limit;
  const page_entries = entries.slice(0, limit);

  const last = page_entries[page_entries.length - 1];
  const next_cursor = has_next
    ? `${last!.trx_date.toISOString()}_${last!.id}`
    : null;

  return reply.code(200).send({
    entries: page_entries.map((e) => ({
	   	account_id: e.account.id,
	    account_name: e.account.name,
	    is_active: e.account.is_active,
    	entry_id: e.id,
    	side: e.side,
      amount: e.amount,
      log_type: e.log_type,
      trx_date: e.trx_date,
      date_logged: e.created_at,
      description: e.description,
      category_id: e.category_id,
      category_name: e.category?.name ?? null,
      is_category_active: e.category?.is_active ?? null,
      transaction_group_id: e.transaction_group_id,
      ...(e.log_type === 'TRANSFER' && { 
      	related_account: e.transaction_group.journal_entries
     			.filter(a => a.account.id !== e.account.id)
      		.map(a => ({ id: a.account.id, name: a.account.name }))[0]
      }),
      ...(e.transaction_group.loans.length > 0 && {
      	related_counterparty: e.transaction_group.loans[0]?.counterparty
      })
    })),
    next_cursor,
    has_next,
  });
}

export const list_transactions = { handler, schema: { querystring: query_schema } };