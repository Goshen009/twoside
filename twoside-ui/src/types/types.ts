export interface Tag {
  id: string;
  name: string;
}

export interface InfoData {
  username: string;
  timezone: string;
  currency_symbol: string;
  total_spent_today: string;
  tags: Tag[];
}

export interface Transaction {
  id: string;
  tag: string | null;
  description: string;
  transaction_date: string; // UTC ISO
  amount: string;
}

export interface Day {
  date: string; // YYYY-MM-DD, already in the user's timezone
  total: string;
  transactions: Transaction[];
}

export interface TransactionsResponse {
  days: Day[];
}

export interface RecordPayload {
  description: string;
  amount: number;
  transaction_date: string; // UTC ISO
  tag?: string;
}

export interface EditPayload {
  description?: string;
  amount?: number;
  transaction_date?: string;
  tag?: string | null; // string = set, null = remove, omitted = leave alone
}