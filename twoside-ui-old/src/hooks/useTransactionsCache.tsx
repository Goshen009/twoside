import type { JournalEntry } from "./useAccountTransactions";
import type { AccountSummary } from "./useAccountSummary";
import { createContext, useContext } from "react";

export interface CachedList {
	entries: JournalEntry[];
  has_next: boolean;
  next_cursor: string | null;
}

export const TransactionsCacheContext = createContext<{
	getSummary: (key: string) => AccountSummary | undefined;
  setSummary: (key: string, value: AccountSummary) => void;
  getList: (key: string) => CachedList | undefined;
  setList: (key: string, value: CachedList) => void;
} | null>(null);

export const useTransactionsCache = () => {
	const ctx = useContext(TransactionsCacheContext);
	if (!ctx) throw new Error("useTransactionsCache must be used within TransactionsCacheProvider");
	return ctx;
};