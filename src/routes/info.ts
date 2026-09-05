import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

import Calc from "#/libs/calc.js";

async function handler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

	const accounts = user.accounts.filter(a => a.system_role === null && a.is_active);

	const [user_data, open_loans] = await Promise.all([
	  this.prisma.user.findUnique({
	    where: { id: user.id },
	    select: {
	      categories: { where: { is_active: true }, select: { id: true, name: true } },
	      counterparties: { where: { is_active: true }, select: { id: true, name: true } },
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
	  })
	]);

  return reply.code(200).send({
  	currency: "₦",  // hard-coded for now
   	IANA: "Africa/Lagos", // also hardcoded for now
    accounts: accounts.map(a => ({
    	id: a.id,
     	name: a.name,
      balance: 100, //hard-coded
    })),
    categories: user_data?.categories ?? [],
    counterparties: user_data?.counterparties ?? [],
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