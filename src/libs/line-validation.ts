import { AccountType, EntrySide, LoanDirection, PrismaClient } from "#/prisma/client.js";
import { AuthenticatedUser } from "#/guards/requireAuth.js";
import Calc from './calc.js';

type Result<T, E> = { ok: true; data: T } | { ok: false; message: string; extensions?: E };

const ok = <T, E = never>(data: T): Result<T, E> => ({ ok: true, data });
const err = <E, T = never>(message: string, extensions?: E): Result<T, E> => ({ ok: false, message, extensions });

class LineValidation {
	static async validate_account_lines(lines: {
		kind: "ACCOUNT",
		amount: number,
		account_id: string,
		category_id: string | null,
		direction: 'DECREASE' | 'INCREASE'
	}[], user: AuthenticatedUser, prisma: PrismaClient) {
		const accounts = await prisma.account.findMany({
			where: { user_id: user.id, id: { in: lines.map(l => l.account_id) },}
		});

		const categories = await prisma.category.findMany({
			where: { user_id: user.id, id: { in: lines.map(l => l.category_id).filter(id => id !== null) } }
		});

		const valid_accounts = [];
		const missing_accounts = [];
		const disabled_accounts = [];
		const missing_categories = [];
		const disabled_categories = [];
		const accounts_with_invalid_category = [];

		for (const line of lines) {
			const account = accounts.find(a => a.id === line.account_id);
			if (!account) {
				missing_accounts.push(line.account_id);
				continue;
			}

			if (account.is_disabled) {
				disabled_accounts.push(line.account_id);
				continue;
			}

			if (line.category_id) {
				const category = categories.find(c => c.id === line.category_id);
				if (!category) {
					missing_categories.push(line.category_id);
					continue;
				}

				if (category.is_disabled) {
					disabled_categories.push(line.category_id);
					continue;
				}

				if (account.type !== 'INCOME' && account.type !== 'EXPENSE') {
					accounts_with_invalid_category.push(line.account_id);
					continue;
				}
			}

			const entry_side: EntrySide = (() => {
				if (account.type === 'ASSET' || account.type === 'EXPENSE') {
	      	if (line.direction === 'INCREASE') return 'DEBIT'
	       	else return 'CREDIT'
	      }
	      else {
	      	if (line.direction === 'INCREASE') return 'CREDIT'
	      	else return 'DEBIT'
	      }
			})();

			valid_accounts.push({
				entry_side,
				amount: line.amount,
				account_id: account.id,
				account_name: account.name,
      	account_type: account.type,
				category_id: line.category_id,
				cateogry_name: line.category_id ? categories.find(c => c.id === line.category_id)?.name : null,
			});
		}

		const create_error = (data: string[], message: string, type: 'accounts' | 'categories' | 'disabled_categories' | 'disabled_accounts' | 'invalid_categories') => {
			return err(message, { type, data });
		}

		if (missing_accounts.length > 0)			
			return create_error(missing_accounts, "The following accounts do not exist", "accounts");

		if (disabled_accounts.length > 0)
			return create_error(disabled_accounts, "The following accounts are disabled", "disabled_accounts");

		if (missing_categories.length > 0)
			return create_error(missing_categories, "The follwoing categories do not exist", "categories");

		if (disabled_categories.length > 0)
			return create_error(disabled_categories, "The following categories are disabled", "disabled_categories");

		if (accounts_with_invalid_category.length > 0)
			return create_error(accounts_with_invalid_category, "Only Income and Expense accounts can have categories", "invalid_categories");

		return ok(valid_accounts);
	}

	static async validate_loan_initiation_lines(lines: {
		amount: number,
		kind: "GIVE_LOAN" | "BORROW",
		counterparty_id: string
	}[], user: AuthenticatedUser, prisma: PrismaClient) {
		const counterparties = await prisma.counterparty.findMany({
			where: { user_id: user.id , id: { in: lines.map(l => l.counterparty_id) } }
		});

		const missing_counterparties = [];
		const disabled_counterparties = [];
		const valid_loan_initiation_lines = [];

		for (const line of lines) {
			const counterparty = counterparties.find(c => c.id === line.counterparty_id);
			if (!counterparty) {
				missing_counterparties.push(line.counterparty_id);
				continue;
			}

			if (counterparty.is_disabled) {
				disabled_counterparties.push(line.counterparty_id);
				continue;
			}

			const { account_id, account_name, loan_direction, account_type, entry_side } = ((): { account_id: string, account_name: string, loan_direction: LoanDirection, account_type: AccountType, entry_side: EntrySide } => {
				if (line.kind === 'GIVE_LOAN') // give loan means that recievables increases and recievables is an asset meaning it increases with debit (confirm please.)
					return { account_id: user.defaults.recievables_account_id, account_name: "Recieveables", account_type: "ASSET", loan_direction: 'GIVEN', entry_side: "DEBIT" }
				else // borrow means that payables increases and payables is a liability and it increases with credit
					return { account_id: user.defaults.payables_account_id, account_name: "Payables", account_type: "LIABILITY", loan_direction: 'BORROWED', entry_side: "CREDIT" }
			})();

			valid_loan_initiation_lines.push({
				entry_side,
				amount: line.amount,
				account_id,
				account_name,
				account_type,
				loan_direction,
				category_id: null,
				counterparty_id: line.counterparty_id,
				counterparty_name: counterparty.name
			});
		}

		const create_error = (data: string[], message: string, type: 'not_found' | 'disabled') => {
			return err(message, { type, data });
		}

		if (missing_counterparties.length > 0)
			return create_error(missing_counterparties, "The following counterparties do not exist", "not_found");

		if (disabled_counterparties.length > 0)
			return create_error(disabled_counterparties, "The following counterparties have been disabled", "disabled");

		return ok(valid_loan_initiation_lines);
	}
	
	static async validate_loan_repayment_lines(lines: {
		amount: number,
		kind: "RECEIVE_LOAN_REPAYMENT" | "REPAY_LOAN",
		loan_id: string
	}[], user: AuthenticatedUser, prisma: PrismaClient) {		
		const loans = await prisma.loan.findMany({
			where: {
				transaction_group: { user_id: user.id },
				id: { in: lines.map(l => l.loan_id) }
			},
			include: { repayments: true }
		});

		const closed_loans = [];
		const missing_loans = [];
		const overpaid_loans = [];
		const invalid_loan_directions = [];
		const valid_loan_repayment_lines = [];

		// running totals across ALL lines in this request per loan_id — 
	  // needed because two lines in the same request could jointly overpay
	  // even if each looks fine on its own against the DB's existing total
		const requested_totals = new Map<string, number>();

		for (const line of lines) {
			const loan = loans.find(l => l.id === line.loan_id)
			if (!loan) {
				missing_loans.push(line.loan_id);
				continue;
			}

			if (loan.status === 'CLOSED') {
				closed_loans.push(line.loan_id);
				continue;
			}

			if (line.kind === 'RECEIVE_LOAN_REPAYMENT' && loan.direction !== 'GIVEN') {
				invalid_loan_directions.push(line.loan_id);
				continue;
			}

			if (line.kind === 'REPAY_LOAN' && loan.direction !== 'BORROWED') {
				invalid_loan_directions.push(line.loan_id);
				continue;
			}

			const already_repaid = loan.repayments.reduce((sum, r) => sum + Calc.to_whole(Number(r.amount)), 0);
    	const remaining = Calc.to_whole(Number(loan.amount)) - already_repaid;

    	const running_total = (requested_totals.get(loan.id) ?? 0) + Calc.to_whole(line.amount);
      requested_totals.set(loan.id, running_total);
      
      if (running_total > remaining) {
        overpaid_loans.push(line.loan_id);
        continue;
      }

      const { account_id, account_name, account_type, entry_side } = ((): { account_id: string, account_name: string, account_type: AccountType, entry_side: EntrySide } => {
				if (line.kind === 'RECEIVE_LOAN_REPAYMENT') // this means that recievables is reducing and it's an asset so it reduces with credit
					return { account_id: user.defaults.recievables_account_id, account_name: "Recieveables", account_type: "ASSET", entry_side: "CREDIT" }
				else // when I repay my loan it means my payables reduces and it's a liability so it reduces with debit
					return { account_id: user.defaults.payables_account_id, account_name: "Payables", account_type: "LIABILITY", entry_side: "DEBIT" }
			})();

      valid_loan_repayment_lines.push({
      	entry_side,
      	amount: line.amount,
      	account_id,
      	account_name,
      	account_type,
       	category_id: null,
      	loan_id: loan.id,
      });
		}

		const create_error = (data: string[], message: string, type: 'closed' | 'missing' | 'overpaid' | 'invalid') => {
			return err(message, { type, data });
		}
		
		if (closed_loans.length > 0)
			return create_error(closed_loans, "The following loans have been fully paid", "closed");

		if (missing_loans.length > 0)
			return create_error(missing_loans, "The following loans do not exist", "missing");

		if (overpaid_loans.length > 0)
			return create_error(overpaid_loans, "The following loans are being overpaid", "overpaid");

		if (invalid_loan_directions.length > 0)
			return create_error(invalid_loan_directions, "The following loans have an invalid direction", "invalid");

		return ok(valid_loan_repayment_lines);
	}
}

export default LineValidation;