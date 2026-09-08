import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TransactionsAPI } from "@/api/TransactionsApi";
import { useAuth } from "@/hooks/useAuth";
import type {
  TransactionEntry,
  TransactionsContextValue,
  TransactionsFilters,
} from "@/types/types";

const PAGE_SIZE = 25;

const DEFAULT_FILTERS: TransactionsFilters = {
  account_id: null,
  category_id: null,
  start_date: null,
  end_date: null,
};

/** Deterministic identity for a filter set (array keeps field order stable). */
function filters_key(filters: TransactionsFilters): string {
  return JSON.stringify([
    filters.account_id ?? null,
    filters.category_id ?? null,
    filters.start_date ?? null,
    filters.end_date ?? null,
  ]);
}

function error_message(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Something went wrong. Please try again.";
}

// eslint-disable-next-line react-refresh/only-export-components
export const TransactionsContext = createContext<TransactionsContextValue | null>(
  null,
);

// eslint-disable-next-line react-refresh/only-export-components
export function useTransactions(): TransactionsContextValue {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return ctx;
}

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { is_authenticated } = useAuth();

  const [filters, setFilters] = useState<TransactionsFilters>(DEFAULT_FILTERS);
  const [entries, setEntries] = useState<TransactionEntry[]>([]);
  const [next_cursor, setNextCursor] = useState<string | null>(null);
  const [has_next, setHasNext] = useState(false);
  const [is_fetching, setIsFetching] = useState(false);
  const [loading_more, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request_seq = useRef(0);
  const is_authenticated_ref = useRef(is_authenticated);
  const filters_ref = useRef(filters);

  // Session transition reset during render (guarded by the prev-value comparison,
  // so it runs once per transition) — the React-sanctioned alternative to calling
  // setState inside useEffect. No ref writes here: react-hooks/refs forbids
  // touching `.current` during render.
  const [prev_authenticated, setPrevAuthenticated] = useState(is_authenticated);
  if (prev_authenticated !== is_authenticated) {
    setPrevAuthenticated(is_authenticated);
    setEntries([]);
    setNextCursor(null);
    setHasNext(false);
    setError(null);
    setLoadingMore(false);
    setIsFetching(is_authenticated);
    if (filters !== DEFAULT_FILTERS) setFilters(DEFAULT_FILTERS);
  }

  // Filter changes are orchestrated here (an event handler, so the seq bump is
  // synchronous with the clear — closing the window where an in-flight fetch for
  // the previous filter set could otherwise resolve into the cleared cache).
  // Full-replacement merge over the current filters; no-ops when nothing changed.
  const set_filters = useCallback((patch: Partial<TransactionsFilters>): void => {
    if (!is_authenticated_ref.current) return;
    const next: TransactionsFilters = { ...filters_ref.current, ...patch };
    if (filters_key(next) === filters_key(filters_ref.current)) return;
    request_seq.current++;
    filters_ref.current = next;
    setEntries([]);
    setNextCursor(null);
    setHasNext(false);
    setError(null);
    setLoadingMore(false);
    setIsFetching(true);
    setFilters(next);
  }, []);

  // Mirror refs and invalidate anything in flight across an auth or filter
  // transition. Runs before the bootstrap effect below, so refs are current when
  // that effect fires.
  useEffect(() => {
    is_authenticated_ref.current = is_authenticated;
    filters_ref.current = filters;
    request_seq.current++;
  }, [is_authenticated, filters]);

  // Bootstrap / reload page 1 for the current filter set. `filters` is an object;
  // because set_filters only ever replaces it when the serialized key changed,
  // object-identity change === real filter change. The render-phase auth reset
  // and set_filters mark the fetch as in-flight; the request_seq guard drops a
  // completion if a newer request or a logout started while it was in flight.
  useEffect(() => {
    if (!is_authenticated) return;

    const seq = ++request_seq.current;
    TransactionsAPI.list({ ...filters, limit: PAGE_SIZE })
      .then((page) => {
        if (seq !== request_seq.current || !is_authenticated_ref.current) return;
        setEntries(page.entries);
        setNextCursor(page.next_cursor);
        setHasNext(page.has_next);
        setError(null);
        setIsFetching(false);
      })
      .catch((err) => {
        if (seq !== request_seq.current || !is_authenticated_ref.current) return;
        setError(error_message(err));
        setIsFetching(false);
      });
  }, [is_authenticated, filters]);

  // Append the next page. Guarded against overlapping fetches; appends via the
  // functional update so a stale completion can't clobber a newer list.
  const load_more = useCallback(async (): Promise<void> => {
    if (!is_authenticated_ref.current) return;
    if (!has_next || !next_cursor || is_fetching || loading_more) return;
    const seq = ++request_seq.current;
    setLoadingMore(true);
    try {
      const page = await TransactionsAPI.list({
        ...filters,
        cursor: next_cursor,
        limit: PAGE_SIZE,
      });
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setEntries((prev) => [...prev, ...page.entries]);
      setNextCursor(page.next_cursor);
      setHasNext(page.has_next);
      setError(null);
    } catch (err) {
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setError(error_message(err));
    } finally {
      if (seq === request_seq.current) setLoadingMore(false);
    }
  }, [has_next, next_cursor, is_fetching, loading_more, filters]);

  // Post-write refresh — reload page 1 from the top (drops deep-loaded pages) for
  // the *current* filters. Read from the ref so a captured refetch can't fire
  // against a stale filter set. Never throws.
  const refetch = useCallback(async (): Promise<void> => {
    if (!is_authenticated_ref.current) return;
    const seq = ++request_seq.current;
    setIsFetching(true);
    setLoadingMore(false);
    try {
      const page = await TransactionsAPI.list({
        ...filters_ref.current,
        limit: PAGE_SIZE,
      });
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setEntries(page.entries);
      setNextCursor(page.next_cursor);
      setHasNext(page.has_next);
      setError(null);
    } catch (err) {
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setError(error_message(err));
    } finally {
      if (seq === request_seq.current) setIsFetching(false);
    }
  }, []);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      entries,
      next_cursor,
      has_next,
      loading: is_fetching && entries.length === 0,
      is_refreshing: is_fetching && entries.length > 0,
      loading_more,
      error,
      filters,
      set_filters,
      load_more,
      refetch,
    }),
    [
      entries,
      next_cursor,
      has_next,
      is_fetching,
      loading_more,
      error,
      filters,
      set_filters,
      load_more,
      refetch,
    ],
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}
