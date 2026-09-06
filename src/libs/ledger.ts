import { AccountingSide, AccountType, LoanDirection, LoanStatus, LogType, PrismaClient } from "#/prisma/client.js";
import { APIError } from "#/errors/APIError.js";
import { Prisma } from "#/prisma/client.js";

import Calc from "./calc.js";
import Balances from "./balances.js";

type CashflowDirection = 'INCREASE' | 'DECREASE';

class Ledger {
	static checkAccount<T extends { id: string, name: string, is_active: boolean}>(
		account_id: string,
		accounts: T[],
	) {
		const account = accounts.find(a => a.id === account_id);
		if (!account)
			throw APIError.custom({ status: 404, message: `The '${account_id}' account does not exist` });
		if (!account.is_active)
			throw APIError.custom({ status: 403, message: `The '${account.name}' account is inactive` });
		return account;
	}
	
	static async checkLoan(
		tx: PrismaClient | Prisma.TransactionClient,
		user_id: string,
		loan_id: string,
		expected_direction: LoanDirection,
		total_amount: number,
		transaction_date: Date,
		bypass_warnings: string[]
	) {
	  const loan = await tx.loan.findFirst({
	    where: { id: loan_id, transaction_group: { user_id } },
	    include: { repayments: true, counterparty: true },
	  });
	  if (!loan)
	    throw APIError.custom({ status: 404, message: `The '${loan_id}' loan does not exist` });
	  if (loan.status === LoanStatus.CLOSED)
	    throw APIError.custom({ status: 400, message: "This loan has already been fully repaid" });
	  if (loan.direction !== expected_direction)
	    throw APIError.custom({ status: 400, message: "This loan's direction does not match this action" });
		
	  const total_repaid = loan.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0);
	  const remaining = Calc.toWholeNumber(Number(loan.amount)) - total_repaid;

		if (Calc.toWholeNumber(total_amount) > remaining)
    	throw APIError.custom({ status: 400, message: `This payment exceeds what's left on this loan` });

		if (!bypass_warnings.includes("REPAYMENT_DATED_BEFORE") && transaction_date < loan.date_issued) {
	    const formatted = loan.date_issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	    throw APIError.warning("REPAYMENT_DATED_BEFORE", `This repayment is dated before the loan was issued (${formatted}).`);
	  }
		
	  return { ...loan, remaining_cents: remaining };
	}

	static async checkSufficientBalance(
	  tx: PrismaClient | Prisma.TransactionClient,
	  lines: { id: string; name: string; type: AccountType; amount: number }[],
	  target_date: Date,
		currency_symbol: string,
	) {
		const format = (amount: number) => `${currency_symbol}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	
	  const balances = await Balances.getBalancesAtDate(tx, lines, target_date);
	  lines.forEach(l => {
	    const balance_in_account = balances[l.id];
	    if (balance_in_account === undefined)
	      throw APIError.custom({ status: 500, message: `Could not resolve balance for account ${l.name}` });
		
	    if (Calc.toWholeNumber(balance_in_account) < Calc.toWholeNumber(l.amount))
	      throw APIError.warning("INSUFFICIENT_BALANCE", `${l.name} only has ${format(balance_in_account)} but ${format(l.amount)} was requested.`);
	  });
	}

	static resolveAccountingSide(type: AccountType, cashflow_direction: CashflowDirection): AccountingSide {
	  if (type === AccountType.ASSET || type === AccountType.EXPENSE) {
	    if (cashflow_direction === 'INCREASE') {
	      return AccountingSide.DEBIT;
	    } else {
	      return AccountingSide.CREDIT;
	    }
	  } else {
	    // LIABILITY, EQUITY, INCOME
	    if (cashflow_direction === 'INCREASE') {
	      return AccountingSide.CREDIT;
	    } else {
	      return AccountingSide.DEBIT;
	    }
	  }
	}

	static trialBalance<T extends { type: AccountType, cashflow_direction: CashflowDirection, amount: number }>(
		accounts: T[]
	): boolean {
		const total_debits = accounts
			.filter(a => this.resolveAccountingSide(a.type, a.cashflow_direction) === AccountingSide.DEBIT)
			.reduce((sum, l) => sum + Calc.toWholeNumber(l.amount), 0);

		const total_credits = accounts
			.filter(a => this.resolveAccountingSide(a.type, a.cashflow_direction) === AccountingSide.CREDIT)
			.reduce((sum, l) => sum + Calc.toWholeNumber(l.amount), 0);

		if (total_debits != total_credits)
			throw APIError.custom({ status: 400, message: 'The accounts are not balanced!' });

		return true;
	}

	static async logTransaction<T extends { id: string, type: AccountType, cashflow_direction: CashflowDirection, amount: number, category_id?: string | null }>(
    tx: Prisma.TransactionClient,
    params: {
      user_id: string,
      description: string,
      transaction_date: Date,
      log_type: LogType,
      lines: T[],
      loan?: { direction: LoanDirection; counterparty_id: string; amount: number },
      repayments?: { loan_id: string; amount: number }[],
    }
  ) {
		this.trialBalance(params.lines);

		const group = await tx.transactionGroup.create({
      data: {
        user_id: params.user_id,
        journal_entries: {
          create: params.lines.map(l => ({
         		log_type: params.log_type,
            transaction_date: params.transaction_date,
            description: params.description,
            amount: l.amount,
            side: this.resolveAccountingSide(l.type, l.cashflow_direction),
            account_id: l.id,
            category_id: l.category_id ?? null,
          })),
        },
        ...(params.loan && {
          loans: {
            create: [{
              status: LoanStatus.OPEN,
              amount: params.loan.amount,
              date_issued: params.transaction_date,
              direction: params.loan.direction,
              counterparty_id: params.loan.counterparty_id,
            }],
          },
        }),
        ...(params.repayments && params.repayments.length > 0 && {
          loan_repayments: {
            create: params.repayments.map(r => ({
              amount: r.amount,
              loan_id: r.loan_id,
              date_repaid: params.transaction_date,
            })),
          },
        }),
      },
    });
		
    await this.rebuildAccountSnapshots(tx, params.transaction_date, params.lines);
		
    if (params.repayments && params.repayments.length > 0) {
      await this.updateStatusAfterRepayment(tx, params.user_id, params.repayments.map(r => r.loan_id));
    }
		
    return group;
	}

	static async rebuildAccountSnapshots<T extends { id: string; amount: number; cashflow_direction: CashflowDirection }>(
    tx: Prisma.TransactionClient,
    transaction_date: Date,
    lines: T[]
  ) {
  	// Deliberately one query pair per line, not batched — keeps each account's snapshot lookup 
   	// correctly scoped to its own history without needing per-account date-floor logic in a 
    // single combined query. See 'AI-powered finance logging system' on my Claude chat for the 
    // tradeoff discussion.
    for (const line of lines) {
      const latest_snapshot = await tx.accountBalanceSnapshot.findFirst({
        where: { account_id: line.id },
        orderBy: { as_of_date: 'desc' },
      });
	
      if (!latest_snapshot || transaction_date > latest_snapshot.as_of_date)
      	continue;

      const delta = line.cashflow_direction === 'INCREASE' 
      	? line.amount
       	: -line.amount;
      
      await tx.accountBalanceSnapshot.updateMany({
        where: { account_id: line.id, as_of_date: { gte: transaction_date } },
        data: { balance: { increment: delta } },
      });
    }
  }

  static async updateStatusAfterRepayment(
    tx: Prisma.TransactionClient,
    user_id: string,
    loan_ids: string[]
  ) {
    const unique_ids = [...new Set(loan_ids)];
  
    const loans = await tx.loan.findMany({
      where: { transaction_group: { user_id }, id: { in: unique_ids } },
      include: { repayments: true },
    });
  
    for (const loan of loans) {
      const total_repaid = loan.repayments.reduce((sum, r) => sum + Calc.toWholeNumber(Number(r.amount)), 0);
      const original = Calc.toWholeNumber(Number(loan.amount));
      
      const new_status = total_repaid >= original 
      	? LoanStatus.CLOSED
       	: LoanStatus.PARTIALLY_REPAID;
  
      await tx.loan.update({ where: { id: loan.id }, data: { status: new_status } });
    }
  }
}

export default Ledger;