import { createContext, useContext } from "react";
import type { Account } from "@/lib/types";

export type AccountsContextValue = {
  accounts: Account[];
  net_total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const accounts_context = createContext<AccountsContextValue | null>(null);

export function useAccounts() {
  const context = useContext(accounts_context);
  if (!context) throw new Error("useAccounts must be used within AccountsProvider");
  return context;
}