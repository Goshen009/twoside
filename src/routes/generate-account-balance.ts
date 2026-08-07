import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { Calc } from "#/libs/index.js";
import { z } from "zod/v4";

const schema = z.object({
	account_id: z.uuid("account_id must be a valid UUID").optional(),
  as_of_date: z.iso.date("as_of_date must be in the format YYYY-MM-DD").transform((val) => new Date(`${val}T23:59:59.999Z`)).optional(),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();
	
  const { account_id, as_of_date } = request.query;
  const target_date = as_of_date ?? new Date();

  // I'll allow you get the balance for even disabled accounts. You just can't write to those accounts without re-enabling them.
  const accounts = await this.prisma.account.findMany({
  	where: {
 			user_id: user.id,
    	...(account_id && { id: account_id })
   	}
  });

  if (account_id && accounts.length === 0)
    throw APIError.custom({ status: 400, message: "This account does not exist" });

  const balance_promises = accounts.map(async (account) => {
  	const balance = await Calc.get_account_balance_at_date(account.id, account.type, target_date, this.prisma);
   	return {
      balance,
     	account_id: account.id,
     	account_name: account.name,
      is_account_disabled: account.is_disabled,
    };
  })

  const data = await Promise.all(balance_promises);

  return reply.code(200).send({ data });
}

export const generate_account_balance = { handler, schema: { querystring: schema } };