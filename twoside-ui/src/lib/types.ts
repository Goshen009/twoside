export type Account = {
	id: string;
	name: string;
	balance: number;
};

export type TransactionType =
	| "expense"
	| "income"
	| "transfer"
	| "loan_given"
	| "loan_borrowed"
	| "loan_repay_received"
	| "loan_repay_paid";

export type Category = {
	id: string;
	name: string;
	is_active: boolean;
};

export type LogType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "GIVE_LOAN"
  | "BORROW"
  | "RECEIVE_REPAYMENT"
  | "REPAY_LOAN";

export type JournalEntry = {
  entry_id: string;
  account_id: string;
  account_name: string;
  is_active: boolean;
  side: "DEBIT" | "CREDIT";
  amount: number;
  log_type: LogType;
  trx_date: string;
  date_logged: string;
  description: string;
  category_id: string | null;
  category_name: string | null;
  is_category_active: boolean | null;
  transaction_group_id: string;
  related_account?: { id: string; name: string };
  related_counterparty?: { id: string; name: string } | null;
};

export type AccountSummary = {
  account_id: string | null;
  account_name: string | null;
  start_date: string;
  end_date: string;
  opening_balance: number;
  closing_balance: number;
  net_change: number;
  total_in: number;
  total_out: number;
};

export type Counterparty = {
  id: string;
  name: string;
  is_active: boolean;
};

export type LoanDirection = "GIVEN" | "BORROWED";
export type LoanStatus = "OPEN" | "PARTIALLY_REPAID" | "CLOSED";

export type Loan = {
  id: string;
  direction: LoanDirection;
  status: LoanStatus;
  amount: number;
  counterparty_name: string;
  date_issued: string;
  total_repaid: number;
};