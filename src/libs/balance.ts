import { APIError } from "#/errors/APIError.js";
import { EntrySide } from "#/prisma/enums.js";
import { z } from "zod/v4";

class Balance {
	static toWholeNumber(n: number) { return Math.round(n * 100); }
	
	static zod() {
		return {
			description: z.string("description is required and must be a string").max(100, "description must not be more than 100 characters"),
			trx_date: z.iso.datetime("trx_date is required and must be in the format 2020-01-01T00:00:00"),
			amount: z.number("amount is required and must be a number").positive("amount must be greater than 0").multipleOf(0.01)
		}
	}

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

	static resolveEntrySide(increases_with: EntrySide, cashflow_direction: 'INCREASE' | 'DECREASE') {
		if (increases_with === 'CREDIT') {
			if (cashflow_direction === 'INCREASE') return EntrySide.CREDIT;
			else return EntrySide.DEBIT;
		} else {
			if (cashflow_direction === 'INCREASE') return EntrySide.DEBIT;
			else return EntrySide.CREDIT;
		}
	}

	static trialBalance<T extends { increases_with: EntrySide, cashflow_direction: 'INCREASE' | 'DECREASE', amount: number }>(
		accounts: T[]
	) {
		const total_debits = accounts
			.filter(a => this.resolveEntrySide(a.increases_with, a.cashflow_direction) === EntrySide.DEBIT)
			.reduce((sum, l) => sum + this.toWholeNumber(l.amount), 0);

		const total_credits = accounts
			.filter(a => this.resolveEntrySide(a.increases_with, a.cashflow_direction) === EntrySide.CREDIT)
			.reduce((sum, l) => sum + this.toWholeNumber(l.amount), 0);

		if (total_debits != total_credits)
			throw APIError.custom({ status: 400, message: 'The accounts are not balanced!' });
		
		return true;
	}
}

export default Balance;