export interface AccountBalance {
  account_id: string;
  name: string;
  balance: number;
}

export interface ValidationErrorField {
  field: string;
  message: string;
}

export type TransactionType = 
  | "expense" 
  | "income" 
  | "transfer" 
  | "loan_given" 
  | "loan_borrowed" 
  | "loan_repay_received" 
  | "loan_repay_paid";

export interface AccountAllocation {
  account_id: string;
  amount: number;
}