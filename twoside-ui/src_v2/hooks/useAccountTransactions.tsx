import { useTransactionsCache } from "./useTransactionsCache";
import { useCallback, useEffect, useState } from "react";
import API from "../libs/api/api";

export type LogType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "GIVE_LOAN"
  | "BORROW"
  | "RECEIVE_REPAYMENT"
  | "REPAY_LOAN";

export interface JournalEntry {
  entry_id: string;
  account_id: string;
  account_name: string;
  is_active: boolean;
  side: "DEBIT" | "CREDIT";
  amount: number;
  log_type: LogType;
  trx_date: string;
  date_logged: string;
  description: string;
  category_id: string | null;
  category_name: string | null;
  is_category_active: boolean | null;
  transaction_group_id: string;
  related_account?: { id: string; name: string };
  related_counterparty?: { id: string; name: string } | null;
}

const PAGE_SIZE = 25;

export const useAccountTransactions = (account_id: string, category_id: string | null, start_date: string, end_date: string) => {
  const cache = useTransactionsCache();
  const key = `${account_id}|${category_id ?? ""}|${start_date}|${end_date}`;
  const cached = cache.getList(key) ?? null;

  const [entries, set_entries] = useState<JournalEntry[]>(cached?.entries ?? []);
  const [next_cursor, set_next_cursor] = useState<string | null>(cached?.next_cursor ?? null);
  const [has_next, set_has_next] = useState(cached?.has_next ?? false);
  const [loading, set_loading] = useState(!cached);
  const [loading_more, set_loading_more] = useState(false);
  const [synced_key, set_synced_key] = useState(key);

  // key changed since the last render → resync entries/pagination/loading for
  // the new key right now, during render, instead of in an effect.
  if (key !== synced_key) {
    set_synced_key(key);
    set_entries(cached?.entries ?? []);
    set_next_cursor(cached?.next_cursor ?? null);
    set_has_next(cached?.has_next ?? false);
    set_loading(!cached);
  }

  useEffect(() => {
    if (cached) return;

    let active = true;
    API.listTransactions({
      account_id: account_id !== "all" ? account_id : undefined,
      category_id: category_id ?? undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      limit: PAGE_SIZE,
    }).then((data) => {
      if (active) {
        set_entries(data.entries);
        set_next_cursor(data.next_cursor);
        set_has_next(data.has_next);
        set_loading(false);
        cache.setList(key, data);
      }
    });
    
    return () => {
      active = false;
    };
  }, [key, cached, account_id, category_id, start_date, end_date, cache]);

  const loadMore = useCallback(async () => {
    if (!has_next || !next_cursor) return;
    set_loading_more(true);
    
    try {
      const data = await API.listTransactions({
        account_id: account_id !== "all" ? account_id : undefined,
        category_id: category_id ?? undefined,
        start_date: start_date || undefined,
        end_date: end_date || undefined,
        limit: PAGE_SIZE,
        cursor: next_cursor,
      });
      set_entries((prev) => {
        const merged = [...prev, ...data.entries];
        cache.setList(key, { entries: merged, next_cursor: data.next_cursor, has_next: data.has_next });
        return merged;
      });
      set_next_cursor(data.next_cursor);
      set_has_next(data.has_next);
    } finally {
      set_loading_more(false);
    }
  }, [key, cache, has_next, next_cursor, account_id, category_id, start_date, end_date]);

  return { entries, has_next, loading, loading_more, loadMore };
};