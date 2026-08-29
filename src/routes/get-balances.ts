import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import Balances from "#/libs/balances.js";

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

  const net_total = balances.reduce((sum, a) => sum + a.balance, 0);
  return reply.code(200).send({ balances, net_total });
}

export const get_balances = { handler };