import { useCallback, useEffect, useState } from "react";
import TransactionsApi from "@/lib/api/transactions";
import type { JournalEntry } from "@/lib/types";

const PAGE_SIZE = 25;

export function useAccountTransactions(
  account_id: string,
  category_id: string | null,
  start_date: string,
  end_date: string
) {
  const [entries, set_entries] = useState<JournalEntry[]>([]);
  const [next_cursor, set_next_cursor] = useState<string | null>(null);
  const [has_next, set_has_next] = useState(false);
  const [loading, set_loading] = useState(true);
  const [loading_more, set_loading_more] = useState(false);

  const base_params = {
    account_id: account_id !== "all" ? account_id : undefined,
    category_id: category_id ?? undefined,
    start_date: start_date || undefined,
    end_date: end_date || undefined,
    limit: PAGE_SIZE,
  };

  useEffect(() => {
    let active = true;
  
    Promise.resolve().then(() => {
      if (active) set_loading(true);
    });
  
    TransactionsApi.list(base_params)
      .then((data) => {
        if (!active) return;
        set_entries(data.entries);
        set_next_cursor(data.next_cursor);
        set_has_next(data.has_next);
      })
      .finally(() => {
        if (active) set_loading(false);
      });
  
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account_id, category_id, start_date, end_date]);

  const loadMore = useCallback(async () => {
    if (!has_next || !next_cursor) return;
    set_loading_more(true);
    try {
      const data = await TransactionsApi.list({ ...base_params, cursor: next_cursor });
      set_entries((prev) => [...prev, ...data.entries]);
      set_next_cursor(data.next_cursor);
      set_has_next(data.has_next);
    } finally {
      set_loading_more(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account_id, category_id, start_date, end_date, has_next, next_cursor]);

  return { entries, has_next, loading, loading_more, loadMore };
}