import { createContext, useContext } from "react";

export interface Account {
	id: string,
	name: string,
	balance: number,
};

export const AccountsContext = createContext<{
  loading: boolean,
  net_total: number,
	accounts: Account[],
  error: string | null,
  refetch: () => void,
  refetch_key: number
} | null>(null);

export const useAccounts = () => {
	const ctx = useContext(AccountsContext);
	if (!ctx) throw new Error("useAccounts must be used within AccountsProvider");
	return ctx;
}