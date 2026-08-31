import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Balances from "#/libs/balances.js";
import Calc from "#/libs/calc.js";

async function handler(
	this: FastifyInstance,
	request: FastifyRequest,
	reply: FastifyReply
) {
  const user = await request.requireAuth();

  const asset_accounts = user.accounts.filter((a) => a.type === 'ASSET' && a.system_role === null);

  const now = new Date();

  const balances = await Promise.all(
    asset_accounts.map(async (account) => ({
      account_id: account.id,
      name: account.name,
      balance: await Balances.getBalanceAtDate(this.prisma, account.id, account.type, now),
    }))
  );

  const net_total_whole = balances.reduce((sum, a) => sum + Calc.toWholeNumber(a.balance), 0);
  const net_total = Calc.toDecimalNumber(net_total_whole);
  
  return reply.code(200).send({ balances, net_total });
}

// the money in and money out calculation on all accounts is wrong
// it adds up transfers too.
// 
// let's not make the dates default to today, it must always be opt-in
// and in the date pickers, it should show the full month
// 
// the amount field should show a comma
// 
// let's make transfer be blue instead of red.

export const get_balances = { handler };