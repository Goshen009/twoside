import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { DateTime } from "luxon";
import { z } from "zod/v4";

const schema = z.object({
	tag_id: z.uuid().optional()
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  const user = await request.requireAuth();

  const { tag_id } = request.query;

  const transactions = await this.prisma.transaction.findMany({
  	where: {
   		user_id: user.id,
     	tag_id
   	},
   	orderBy: { transaction_date: 'desc' },
    include: { 
    	tag: true,
    	entries: { where: { side: 'DEBIT' } }
    }
  });

  const days = new Map<string, { date: string, total: Prisma.Decimal, transactions: any[] }>();

  transactions.forEach(t => {
  	const date = DateTime.fromJSDate(t.transaction_date, { zone: user.timezone }).toISODate()!;
   	const amount = t.entries[0]?.amount ?? new Prisma.Decimal(0);

    if (!days.has(date)) days.set(date, { date, total: new Prisma.Decimal(0), transactions: [] });

    const day = days.get(date)!;
    day.total = day.total.plus(amount);
    day.transactions.push({
    	id: t.id,
     	tag: t.tag?.name ?? null,
     	description: t.description,
      transaction_date: t.transaction_date,
      amount: amount.toFixed(2)
    });
  });

  return reply.code(200).send({ days: [...days.values()].map(d => ({ ...d, total: d.total.toFixed(2) })) });
}

export const transactions = { handler, schema: { querystring: schema } };