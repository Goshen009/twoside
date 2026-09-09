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
	      categories: { where: { is_active: true, is_charge: false }, orderBy: { name: 'asc' }, select: { id: true, name: true } },
				counterparties: { where: { is_active: true }, orderBy: { name: 'asc' }, select: { id: true, name: true } },
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

	const total_you_are_owed_cents = open_loans
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
	
	const total_you_are_owed = Calc.toDecimalNumber(total_you_are_owed_cents);
	const total_you_owe = Calc.toDecimalNumber(total_you_owe_cents);

  return reply.code(200).send({
  	currency_symbol: user.currency_symbol,
   	iana_timezone: user.iana_timezone,
    accounts: accounts.map(a => ({
    	id: a.id,
     	name: a.name,
      balance: balances[a.id],
    })),
    categories: user_data?.categories ?? [],
    counterparties: user_data?.counterparties ?? [],
    total_you_are_owed,
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