"use client";

import { useState, useEffect } from "react";
import { AccountBalance } from "@/lib/types";
import { api } from "@/lib/api";
import BalanceCarousel from "@/components/modules/BalanceCarousel";
import TransactionForm from "@/components/modules/TransactionForm";

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    async function fetchBalances() {
      try {
        const data = await api.getBalances();
        setAccounts(data.balances);
      } catch (err) {
        console.error("Failed to load balances", err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    fetchBalances();
  }, []);

  return (
    <div className="p-4 space-y-6 pb-12">
      {loadingAccounts ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center text-muted text-xs animate-pulse">
          Loading accounts...
        </div>
      ) : (
        <BalanceCarousel accounts={accounts} />
      )}

      <TransactionForm accounts={accounts} />
    </div>
  );
}