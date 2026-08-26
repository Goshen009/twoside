export type AssetAccountBalance = {
  account_id: string;
  name: string;
  balance: number;
};

export type BalancesResponse = {
  balances: AssetAccountBalance[];
};

export type LogActionType =
  | "transfer"
  | "income"
  | "expense"
  | "loan_given"
  | "loan_borrowed"
  | "receive_repayment"
  | "repay_loan";

export type AccountAllocation = {
  account_id: string;
  amount: number;
};