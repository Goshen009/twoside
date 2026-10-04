import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { DateTime } from "luxon";
import { z } from "zod/v4";

const schema = z.object({

});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
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

  const total = result._sum.amount ? Number(result._sum.amount) : 0;
  
  return reply.code(200).send({ start_time, end_time, total });
}

export const query = { handler, schema: { querystring: schema } };