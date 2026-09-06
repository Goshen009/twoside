import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { z } from "zod/v4";

// import Balances from "#/libs/balances.js";

const schema = z.object({
  start_date: z.iso.date().transform((val) => new Date(`${val}T00:00:00.000Z`)),
  end_date: z.iso.date().transform((val) => new Date(`${val}T23:59:59.999Z`)),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
  // const user = await request.requireAuth();
  const { start_date, end_date } = request.query;

  // const receivables_id = user.system_accounts.RECEIVABLES!.id;
  // const payables_id = user.system_accounts.PAYABLES!.id;
  // const receivables_type = user.system_accounts.RECEIVABLES!.type;
  // const payables_type = user.system_accounts.PAYABLES!.type;

  // const just_before_start = new Date(start_date.getTime() - 1);

  const [owed_to_you_before, owed_to_you_now, you_owe_before, you_owe_now] = await Promise.all([
    // Balances.getBalanceAtDate(this.prisma, receivables_id, receivables_type, just_before_start),
    // Balances.getBalanceAtDate(this.prisma, receivables_id, receivables_type, end_date),
    // Balances.getBalanceAtDate(this.prisma, payables_id, payables_type, just_before_start),
    // Balances.getBalanceAtDate(this.prisma, payables_id, payables_type, end_date),
    0, 0, 0, 0
  ]);

  return reply.code(200).send({
    start_date,
    end_date,
    owed_to_you: { before: owed_to_you_before, now: owed_to_you_now },
    you_owe: { before: you_owe_before, now: you_owe_now },
  });
}

export const get_loans_summary = { handler, schema: { querystring: schema } };