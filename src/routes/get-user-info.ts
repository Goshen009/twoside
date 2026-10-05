import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { Prisma } from "#/prisma/client.js";
import { DateTime } from "luxon";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const start_of_today = DateTime.now().setZone(user.timezone).startOf("day");

  const start_time = start_of_today.toJSDate();
  const end_time = start_of_today.plus({ days: 1 }).toJSDate();

  const result = await this.prisma.entries.aggregate({
  	_sum: { amount: true },
   	where: {
    	side: 'DEBIT',
     	account: { user_id: user.id },
      transaction: { transaction_date: { gte: start_time, lt: end_time } }
    }
  });

  const total = result._sum.amount ? result._sum.amount : new Prisma.Decimal(0);

  return reply.code(200).send({
  	username: user.name,
   	timezone: user.timezone,
    currency_symbol: "₦",
    total_spent_today: total,
    tags: user.tags.map(t => ({
    	id: t.id,
     	name: t.name
    }))
  });
}

export const get_user_info = { handler };