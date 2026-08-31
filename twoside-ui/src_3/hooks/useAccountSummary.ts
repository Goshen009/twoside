import { useEffect, useState } from "react";
import TransactionsApi from "@/lib/api/transactions";
import type { AccountSummary } from "@/lib/types";

const ALL_TIME_START = "2000-01-01";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function useAccountSummary(account_id: string, start_date: string, end_date: string) {
  const [summary, set_summary] = useState<AccountSummary | null>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let active = true;
  
    Promise.resolve().then(() => {
      if (active) set_loading(true);
    });
  
    TransactionsApi.getSummary({
      account_id: account_id !== "all" ? account_id : undefined,
      start_date: start_date || ALL_TIME_START,
      end_date: end_date || todayStr(),
    })
      .then((data) => {
        if (active) set_summary(data);
      })
      .finally(() => {
        if (active) set_loading(false);
      });
  
    return () => {
      active = false;
    };
  }, [account_id, start_date, end_date]);

  return { summary, loading };
}