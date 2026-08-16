export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type EntrySide = 'DEBIT' | 'CREDIT';
export type LoanDirection = 'GIVEN' | 'BORROWED';
export type LoanStatus = 'OPEN' | 'PARTIALLY_REPAID' | 'CLOSED';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  default: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Counterparty {
  id: string;
  name: string;
}

export interface Loan {
  id: string;
  direction: LoanDirection;
  status: LoanStatus;
  amount: number;
  counterparty_name: string;
  date_issued: string;
  total_repaid: number;
}

export type LineKind =
  | 'ACCOUNT'
  | 'GIVE_LOAN'
  | 'BORROW'
  | 'RECEIVE_LOAN_REPAYMENT'
  | 'REPAY_LOAN';

export type TransactionLine =
  | { kind: 'ACCOUNT'; account_id: string; category_id: string | null; amount: number; direction: 'INCREASE' | 'DECREASE' }
  | { kind: 'GIVE_LOAN' | 'BORROW'; amount: number; counterparty_id: string }
  | { kind: 'RECEIVE_LOAN_REPAYMENT' | 'REPAY_LOAN'; amount: number; loan_id: string };

export interface TransactionPayload {
  description: string;
  trx_date: string;
  lines: TransactionLine[];
}