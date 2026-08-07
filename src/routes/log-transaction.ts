import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { LineValidation, Calc } from "#/libs/index.js";
import { LoanStatus } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";
import { z } from "zod/v4";

const amount_schema = z.number("amount is required and must be a number").positive("amount must be greater than 0").multipleOf(0.01);

const schema = z.object({
	description: z.string("description is required and must be a string").max(100, "description must not be more than 100 characters"),
	trx_date: z.iso.datetime("trx_date is required and must be in the format 2020-01-01T00:00:00"),
	lines: z.array(
		z.discriminatedUnion('kind', [
			z.object({
				amount: amount_schema,
				kind: z.literal("ACCOUNT"),
				account_id: z.uuid("account_id is required and must be a valid UUID"),
				category_id: z.uuid("category_id must be a valid UUID or null").nullable(),
				direction: z.enum(["DECREASE", "INCREASE"]),
			}),
			z.object({
				amount: amount_schema,
				kind: z.literal("GIVE_LOAN"),
				counterparty_id: z.uuid("counterparty_id is required and must be a valid UUID")
			}),
			z.object({
				amount: amount_schema,
				kind: z.literal("RECEIVE_LOAN_REPAYMENT"),
				loan_id: z.uuid("loan_id is required and must be a valid UUID")
			}),
			z.object({
				amount: amount_schema,
				kind: z.literal("BORROW"),
				counterparty_id: z.uuid("counterparty_id is required and must be a valid UUID")
			}),
			z.object({
				amount: amount_schema,
				kind: z.literal("REPAY_LOAN"),
				loan_id: z.uuid("loan_id is required and must be a valid UUID")
			})
		])
	).refine((val) => val.length >= 2, { error: "at least two lines must be present" }),
});

async function handler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: z.infer<typeof schema> }>,
  reply: FastifyReply
) {
	const user = await request.requireAuth();

  const { description, trx_date, lines } = request.body;

  const account_lines = lines.filter(l => l.kind === 'ACCOUNT');
  const account_lines_result = await LineValidation.validate_account_lines(account_lines, user, this.prisma);

  if (!account_lines_result.ok)
  	throw APIError.custom({ status: 400, message: account_lines_result.message, extensions: account_lines_result.extensions});

  const loan_initiation_lines = lines.filter(l => l.kind === 'GIVE_LOAN' || l.kind === 'BORROW');
  const loan_initiation_lines_result = await LineValidation.validate_loan_initiation_lines(loan_initiation_lines, user, this.prisma);

  if (!loan_initiation_lines_result.ok)
  	throw APIError.custom({ status: 400, message: loan_initiation_lines_result.message, extensions: loan_initiation_lines_result.extensions});

  const loan_repayment_lines = lines.filter(l => l.kind === 'RECEIVE_LOAN_REPAYMENT' || l.kind === 'REPAY_LOAN');
  const loan_repayment_lines_result = await LineValidation.validate_loan_repayment_lines(loan_repayment_lines, user, this.prisma);

  if (!loan_repayment_lines_result.ok)
  	throw APIError.custom({ status: 400, message: loan_repayment_lines_result.message, extensions: loan_repayment_lines_result.extensions });

  const all_lines = [
  	...account_lines_result.data,
   	...loan_initiation_lines_result.data,
    ...loan_repayment_lines_result.data,
  ];

  const total_debit = all_lines.filter(l => l.entry_side === 'DEBIT').reduce((sum, l) => sum + Calc.to_whole(l.amount), 0);
  const total_credit = all_lines.filter(l => l.entry_side === 'CREDIT').reduce((sum, l) => sum + Calc.to_whole(l.amount), 0);

  if (total_debit !== total_credit)
    throw APIError.custom({ status: 400, message: 'The accounts are not balanced!' });

  await this.prisma.$transaction(async (tx) => {
	  await tx.transactionGroup.create({
	 		data: {
				user_id: user.id,
	 			journal_entries: {
	  			create: all_lines.map(l => ({
						trx_date,
						description,
						amount: l.amount,
			  		side: l.entry_side,
						account_id: l.account_id,
						category_id: l.category_id
		     	}))
	    	},
	     	loans: {
	     		create: loan_initiation_lines_result.data.map(l => ({
	     			status: 'OPEN',
	        	amount: l.amount,
	        	date_issued: trx_date,
	       		direction: l.loan_direction,
	        	counterparty_id: l.counterparty_id
	       	}))
	      },
	      loan_repayments: {
					create: loan_repayment_lines_result.data.map(l => ({
						amount: l.amount,
						loan_id: l.loan_id,
						date_repaid: trx_date,
					}))
				}
	   	}
	  });

		// now we need to update the loan status
		const loans_repaid = [... new Set(loan_repayment_lines_result.data.map(l => l.loan_id))];
		const loans = await tx.loan.findMany({
			where: { 
				transaction_group: { user_id: user.id },
				id: { in: loans_repaid}
			},
			include: { repayments: true }
		});

		for (const loan_id of loans_repaid) {
			const loan = loans.find(l => l.id === loan_id)!; // cause it literally cannot not exist.

			const total_repaid = loan.repayments.reduce((sum, r) => sum + Calc.to_whole(Number(r.amount)), 0);
			const original = Calc.to_whole(Number(loan.amount));

			const new_status: LoanStatus = total_repaid >= original ? 'CLOSED' : 'PARTIALLY_REPAID';

			await tx.loan.update({
		    where: { id: loan_id },
		    data: { status: new_status }
		  });
		}

		// now we re-calculate the snapshot (if need be)
		for (const line of all_lines) {
			const latest_snapshot = await tx.accountBalanceSnapshot.findFirst({
				where: { account_id: line.account_id },
				orderBy: { as_of_date: 'desc' }
			});

			if (latest_snapshot && new Date(trx_date) <= latest_snapshot.as_of_date) {
				const delta = Calc.resolve_delta(line.account_type, line.entry_side, Calc.to_whole(Number(line.amount)));
				
				await tx.accountBalanceSnapshot.updateMany({
					where: { account_id: line.account_id, as_of_date: { gte: new Date(trx_date) } },
					data: { 
						balance: { increment: delta / 100 }
					}
				});
			}
		}
  });

  return reply.code(200).send({ message: "Transaction recorded!" });
}

export const log_transaction = { handler, schema: { body: schema } };