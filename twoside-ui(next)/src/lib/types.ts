export type TransactionType = 
  | "expense" 
  | "income" 
  | "transfer" 
  | "loan_given" 
  | "loan_borrowed" 
  | "loan_repay_received" 
  | "loan_repay_paid";

export interface AccountBalance {
  id: string;
  name: string;
  balance: number;
  currency: string;
}