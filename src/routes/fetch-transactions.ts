import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";
import { Calc } from "#/libs/index.js";
import { z } from "zod/v4";

const query_schema = z.object({
	start_date: z.iso.date("start_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date("end_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  with_balances: z.enum(["true", "false"]).default("false").transform(v => v === "true")
});

const path_schema = z.object({
	account_id: z.uuid("account_id must be a valid UUID"),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: z.infer<typeof path_schema>, Querystring: z.infer<typeof query_schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const { account_id } = request.params;
  const { start_date, end_date, page, limit, with_balances } = request.query;

  const account = await this.prisma.account.findFirst({
    where: { id: account_id, user_id: user.id }
  });
  
  if (!account)
    throw APIError.custom({ status: 400, message: "This account does not exist" });

  const skip = (page - 1) * limit;
  const where: Prisma.JournalEntryWhereInput = { 
  	account_id, 
   	trx_date: { gte: start_date, lte: end_date }
  }

  // "balance just before start_date" — one tick before, so start_date's own entries
  // don't get double-counted between the opening balance and the listed range
  const just_before_start = new Date(start_date.getTime() - 1);

  const [opening_balance, closing_balance, entries, total] = await Promise.all([
 		with_balances ? Calc.get_account_balance_at_date(account.id, account.type, just_before_start, this.prisma) : null,
    with_balances ? Calc.get_account_balance_at_date(account.id, account.type, end_date, this.prisma) : null,
    this.prisma.journalEntry.findMany({
   		where,
      orderBy: { trx_date: 'asc' },
      skip,
			take: limit,
			include: {
				category: {
					select: { name: true, is_disabled: true }
				}
			}
    }),
    this.prisma.journalEntry.count({ where })
  ]);

  const total_pages = Math.ceil(total / limit);

  return reply.code(200).send({
 		account_id: account.id,
   	account_name: account.name,
    opening_balance: with_balances ? opening_balance : undefined,
    closing_balance: with_balances ? closing_balance : undefined,
    is_account_disabled: account.is_disabled,
    entries: entries.map(e => ({
    	id: e.id,
     	side: e.side,
      amount: e.amount,
      trx_date: e.trx_date,
      date_logged: e.created_at,
      description: e.description,
      category_id: e.category_id,
      category_name: e.category?.name ?? null,
      is_category_disabled: e.category?.is_disabled ?? null,
      transaction_group_id: e.transaction_group_id
    })),
    pagination: {
    	total,
     	page,
     	limit,
     	total_pages,
     	has_next: page < total_pages,
     	has_prev: page > 1
    }
  });
}

export const fetch_transactions = { handler, schema: { params: path_schema, querystring: query_schema } };