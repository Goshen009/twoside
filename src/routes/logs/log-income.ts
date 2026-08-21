import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";
import Balance from "#/libs/balance.js";

const schema = z.object({
	...Balance.zod(),
	account_id: z.uuid("account_id is required and must be a valid UUID")
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { description, trx_date, amount, account_id } = request.body;

  // the account the money is being received into
  const destination_account = Balance.checkAccount(account_id, user.accounts);

  if (destination_account.type !== 'ASSET')
  	throw APIError.custom({ status: 400, message: "Income can only be received into an asset account" });

  // TEMP: resolve the source via the user's default INCOME account.
  // To be replaced with proper income-account/category selection later.
  const income_account = user.accounts.find(a => a.default === 'INCOME');

  if (!income_account)
  	throw APIError.custom({ status: 400, message: "User is missing a default income account" });

  const accounts = [
  	{ ...destination_account, amount, cashflow_direction: 'INCREASE' as const },
  	{ ...income_account, amount, cashflow_direction: 'INCREASE' as const }
  ];

  Balance.trialBalance(accounts);

  await this.prisma.$transaction(async (tx) => {
  	await tx.transactionGroup.create({
  		data: {
  			user_id: user.id,
  			journal_entries: {
  				create: accounts.map(a => ({
  					trx_date,
  					description,
  					amount: a.amount,
  					side: Balance.resolveEntrySide(a.increases_with, a.cashflow_direction),
  					account_id: a.id,
  					category_id: null
  				}))
  			}
  		}
  	});

  	await Balance.rebuildSnapshots(tx, accounts, trx_date);
  });

  return reply.code(200).send({ message: "Successful" });
}

export const log_income = { handler, schema: { body: schema } };
