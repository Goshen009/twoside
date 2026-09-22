import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

import Calc from "#/libs/calc.js";
import Balances from "#/libs/balances.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const accounts = user.accounts.filter(a => a.system_role === null && a.is_active);

	const [user_data, open_loans, balances] = await Promise.all([
	  this.prisma.user.findUnique({
	    where: { id: user.id },
	    select: {
				profile: { select: { username: true, currency_symbol: true, iana_timezone: true } },
	      categories: { where: { is_charge: false }, orderBy: { name: 'asc' }, select: { id: true, name: true, is_active: true } },
				counterparties: { where: {  }, orderBy: { name: 'asc' }, select: { id: true, name: true, is_active: true } },
	    },
	  }),
	  this.prisma.loan.findMany({
	    where: {
	      transaction_group: { user_id: user.id },
	      status: { in: ['OPEN', 'PARTIALLY_REPAID'] }
	    },
	    select: {
	      id: true,
	      amount: true,
	      status: true,
	      direction: true,
	      date_issued: true,
	      counterparty: { select: { id: true, name: true } },
	      repayments: { select: { amount: true } }
	    }
	  }),
		Balances.getBalancesAtDate(this.prisma, accounts, new Date())
	]);

	const total_owed_to_you_cents = open_loans
	  .filter(l => l.direction === 'GIVEN')
	  .reduce((sum, l) => {
	    const repaid = l.repayments.reduce((s, r) => s + Calc.toWholeNumber(Number(r.amount)), 0);
	    return sum + Calc.toWholeNumber(Number(l.amount)) - repaid;
	  }, 0);
	
	const total_you_owe_cents = open_loans
	  .filter(l => l.direction === 'BORROWED')
	  .reduce((sum, l) => {
	    const repaid = l.repayments.reduce((s, r) => s + Calc.toWholeNumber(Number(r.amount)), 0);
	    return sum + Calc.toWholeNumber(Number(l.amount)) - repaid;
	  }, 0);
	
	const total_owed_to_you = Calc.toDecimalNumber(total_owed_to_you_cents);
	const total_you_owe = Calc.toDecimalNumber(total_you_owe_cents);

  return reply.code(200).send({
  	username: user.profile.username,
  	currency_symbol: user.profile.currency_symbol,
   	iana_timezone: user.profile.iana_timezone,
    accounts: accounts.map(a => ({
    	id: a.id,
     	name: a.name,
      balance: balances[a.id],
    })),
    categories: user_data?.categories ?? [],
    counterparties: user_data?.counterparties ?? [],
    total_owed_to_you,
    total_you_owe,
    open_loans: open_loans.map(l => ({
    	id: l.id,
     	amount: Number(l.amount),
      status: l.status,
      direction: l.direction,
      date_issued: l.date_issued,
      counterparty_id: l.counterparty.id,
      counterparty_name: l.counterparty.name,
      total_repaid: Calc.toDecimalNumber(l.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0))
    }))
  });
}

export const info = { handler };