import { useEffect, useState, type ReactNode } from "react";
import { accounts_context } from "./accounts-context";
import AccountsApi from "@/lib/api/accounts";
import type { Account } from "@/lib/types";

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, set_accounts] = useState<Account[]>([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [refetch_key, set_refetch_key] = useState(0);
  const [net_total, set_net_total] = useState(0)

  useEffect(() => {
    let active = true;

    AccountsApi.getBalances()
      .then((data) => {
        if (active) {
          set_accounts(data.accounts);
          set_net_total(data.net_total);
          set_error(null);
        }
      })
      .catch((err) => {
        if (active) {
          set_error(err instanceof Error ? err.message : "Failed to load accounts");
        }
      })
      .finally(() => {
        if (active) set_loading(false);
      });

    return () => {
      active = false;
    };
  }, [refetch_key]);

  function refetch() {
    set_loading(true); // this call is fine — it's inside a plain function, not inside the effect's own body
    set_refetch_key((prev) => prev + 1);
  }

  return (
    <accounts_context.Provider value={{ accounts, loading, error, refetch, net_total }}>
      {children}
    </accounts_context.Provider>
  );
}