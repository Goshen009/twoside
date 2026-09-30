import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { z } from "zod/v4";

const query_schema = z.object({
	cursor: z.string()
	  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_[0-9a-fA-F-]{36}$/, "cursor is malformed")
	  .transform((val) => {
	    const [transaction_date_str, posted_at_str, id] = val.split("_");
	    return { transaction_date: new Date(transaction_date_str!), posted_at: new Date(posted_at_str!), id: id! };
	  })
	  .optional(),
	log_types: z.string()
		.transform((val) => val.split(",").filter(Boolean))
		.pipe(z.array(z.enum(["INCOME", "EXPENSE", "TRANSFER", "GIVE_LOAN", "BORROW", "RECEIVE_REPAYMENT", "REPAY_LOAN"], "Unknown log type")))
		.optional(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  category_id: z.uuid("category_id must be a valid UUID").optional(),
  account_id: z.uuid("account_id must be a valid UUID").optional(),
  jump_to_date: z.iso.datetime("jump_to_date must be in the format 2020-01-01T00:00:00Z").transform((val) => new Date(val)).optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { cursor, log_types, limit, category_id, account_id, jump_to_date } = request.query;

  if (account_id && !user.accounts.find(a => a.id === account_id))
    throw APIError.custom({ status: 400, message: "This account does not exist" });

  const where: Prisma.JournalEntryWhereInput = {
    transaction_group: { user_id: user.id },
    account: { system_role: null },
    ...(account_id && { account_id }),
    ...(category_id && { category_id }),
    ...(log_types && log_types.length > 0 && { log_type: { in: log_types } }),
    ...(jump_to_date && { transaction_date: { lte: jump_to_date } }),
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
    take: limit + 1, // fetch one extra to know if there's a next page
    orderBy: [{ transaction_date: 'desc' }, { posted_at: 'desc' }, { id: 'desc' }],
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
          },
          loan_repayments: {
						select: {
							loan: {
								select: {
									counterparty: { select: { id: true, name: true } },
								},
							},
						},
          },
       	}
      }
    },
  });

  const has_next = entries.length > limit;
  const page_entries = entries.slice(0, limit);

  const last = page_entries[page_entries.length - 1];
  const next_cursor = has_next
    ? `${last!.transaction_date.toISOString()}_${last!.posted_at.toISOString()}_${last!.id}`
    : null;

  return reply.code(200).send({
    entries: page_entries.map((e) => {
	   	const counterparty =
				e.transaction_group.loans[0]?.counterparty ??
				e.transaction_group.loan_repayments[0]?.loan.counterparty;
    
		  return {
				account_id: e.account.id,
		    account_name: e.account.name,
		    is_active: e.account.is_active,
	    	entry_id: e.id,
	    	side: e.side,
	      amount: Number(e.amount),
	      charge_amount: e.charge_amount ? Number(e.charge_amount) : null,
	      log_type: e.log_type,
	      transaction_date: e.transaction_date,
	      date_logged: e.posted_at,
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
	      ...(counterparty && { related_counterparty: counterparty }),
			};
    }),
    next_cursor,
    has_next,
  });
}

export const list_transactions = { handler, schema: { querystring: query_schema } };