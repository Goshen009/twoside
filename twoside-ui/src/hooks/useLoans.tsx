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
import { LoansAPI } from "@/api/LoansApi";
import { useAuth } from "@/hooks/useAuth";
import type {
  LoanEntry,
  LoansContextValue,
  LoansFilters,
} from "@/types/types";

const PAGE_SIZE = 25;

const DEFAULT_FILTERS: LoansFilters = {
  status: null,
  direction: null,
  counterparty_id: null,
};

/** Deterministic identity for a filter set (array keeps field order stable). */
function filters_key(filters: LoansFilters): string {
  return JSON.stringify([
    filters.status ?? null,
    filters.direction ?? null,
    filters.counterparty_id ?? null,
  ]);
}

function error_message(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Something went wrong. Please try again.";
}

// eslint-disable-next-line react-refresh/only-export-components
export const LoansContext = createContext<LoansContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useLoans(): LoansContextValue {
  const ctx = useContext(LoansContext);
  if (!ctx) {
    throw new Error("useLoans must be used within LoansProvider");
  }
  return ctx;
}

export function LoansProvider({ children }: { children: ReactNode }) {
  const { is_authenticated } = useAuth();

  const [filters, setFilters] = useState<LoansFilters>(DEFAULT_FILTERS);
  const [loans, setLoans] = useState<LoanEntry[]>([]);
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
    setLoans([]);
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
  const set_filters = useCallback((patch: Partial<LoansFilters>): void => {
    if (!is_authenticated_ref.current) return;
    const next: LoansFilters = { ...filters_ref.current, ...patch };
    if (filters_key(next) === filters_key(filters_ref.current)) return;
    request_seq.current++;
    filters_ref.current = next;
    setLoans([]);
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
    LoansAPI.list({ ...filters, limit: PAGE_SIZE })
      .then((page) => {
        if (seq !== request_seq.current || !is_authenticated_ref.current) return;
        setLoans(page.loans);
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
      const page = await LoansAPI.list({
        ...filters,
        cursor: next_cursor,
        limit: PAGE_SIZE,
      });
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setLoans((prev) => [...prev, ...page.loans]);
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
      const page = await LoansAPI.list({
        ...filters_ref.current,
        limit: PAGE_SIZE,
      });
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setLoans(page.loans);
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

  const value = useMemo<LoansContextValue>(
    () => ({
      loans,
      next_cursor,
      has_next,
      loading: is_fetching && loans.length === 0,
      is_refreshing: is_fetching && loans.length > 0,
      loading_more,
      error,
      filters,
      set_filters,
      load_more,
      refetch,
    }),
    [
      loans,
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
    <LoansContext.Provider value={value}>{children}</LoansContext.Provider>
  );
}
