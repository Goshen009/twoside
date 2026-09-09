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

/** Deterministic identity for a filter set (array keeps field order stable).
 *  This is also the in-memory cache key: one cached feed window per filter set,
 *  so switching accounts (or filters) restores the previously loaded feed
 *  instead of re-fetching page 1. */
function filters_key(filters: TransactionsFilters): string {
  return JSON.stringify([
    filters.account_id ?? null,
    filters.category_id ?? null,
    filters.start_date ?? null,
    filters.end_date ?? null,
  ]);
}

/** Bump the per-window sequence and return the new value. A completion only
 *  commits when its seq still matches the window's latest — this drops stale
 *  responses (StrictMode double-fetch, a superseding page-1 reload, an append
 *  racing a logout) without invalidating fetches for *other* windows. */
function next_seq(seq_map: Map<string, number>, key: string): number {
  const next = (seq_map.get(key) ?? 0) + 1;
  seq_map.set(key, next);
  return next;
}

function error_message(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Something went wrong. Please try again.";
}

/** One cached feed window. Kept in a Map keyed by `filters_key(filters)`, so a
 *  view the user leaves is preserved with its full loaded page chain. */
type CachedWindow = {
  filters: TransactionsFilters;
  entries: TransactionEntry[];
  next_cursor: string | null;
  has_next: boolean;
  error: string | null;
  is_fetching: boolean; // page-1 load in flight
  loading_more: boolean; // append in flight
};

function empty_window(filters: TransactionsFilters): CachedWindow {
  return {
    filters,
    entries: [],
    next_cursor: null,
    has_next: false,
    error: null,
    is_fetching: false,
    loading_more: false,
  };
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

  // The active filter set selects which cached window the context exposes.
  const [filters, setFilters] = useState<TransactionsFilters>(DEFAULT_FILTERS);
  const [windows, setWindows] = useState<Map<string, CachedWindow>>(
    () => new Map(),
  );

  const request_seq = useRef(new Map<string, number>());
  const is_authenticated_ref = useRef(is_authenticated);
  const filters_ref = useRef(filters);
  const windows_ref = useRef(windows);

  // Session transition reset during render (guarded by the prev-value comparison,
  // so it runs once per transition) — the React-sanctioned alternative to calling
  // setState inside useEffect. No ref writes here: react-hooks/refs forbids
  // touching `.current` during render.
  const [prev_authenticated, setPrevAuthenticated] = useState(is_authenticated);
  if (prev_authenticated !== is_authenticated) {
    setPrevAuthenticated(is_authenticated);
    setWindows(new Map());
    if (filters !== DEFAULT_FILTERS) setFilters(DEFAULT_FILTERS);
  }

  // Mirror refs so callbacks (which are stable) always read the latest values,
  // and drop the per-window seq map on logout so no old session can commit.
  useEffect(() => {
    is_authenticated_ref.current = is_authenticated;
    filters_ref.current = filters;
    windows_ref.current = windows;
    if (!is_authenticated) request_seq.current.clear();
  }, [is_authenticated, filters, windows]);

  // Load page 1 for the active filter set — but only when that window is NOT
  // already cached. A cache hit means the view the user just switched to is
  // served from memory (no request); a miss (or a window left in error) fetches.
  // Runs after paint, so the render before it derives `loading` from the absent
  // window. Commits via .then/.catch (no synchronous setState) per the
  // react-hooks/set-state-in-effect rule.
  useEffect(() => {
    if (!is_authenticated) return;

    const key = filters_key(filters);
    const cached = windows_ref.current.get(key);
    if (cached && !cached.error) return;

    const seq = next_seq(request_seq.current, key);
    TransactionsAPI.list({ ...filters, limit: PAGE_SIZE })
      .then((page) => {
        if (!is_authenticated_ref.current) return;
        if ((request_seq.current.get(key) ?? 0) !== seq) return;
        setWindows((prev) => {
          const prior = prev.get(key);
          const next = new Map(prev);
          next.set(key, {
            filters,
            entries: page.entries,
            next_cursor: page.next_cursor,
            has_next: page.has_next,
            error: null,
            is_fetching: false,
            loading_more: prior?.loading_more ?? false,
          });
          return next;
        });
      })
      .catch((err) => {
        if (!is_authenticated_ref.current) return;
        if ((request_seq.current.get(key) ?? 0) !== seq) return;
        setWindows((prev) => {
          const prior = prev.get(key);
          const next = new Map(prev);
          next.set(key, {
            filters,
            entries: prior?.entries ?? [],
            next_cursor: prior?.next_cursor ?? null,
            has_next: prior?.has_next ?? false,
            error: error_message(err),
            is_fetching: false,
            loading_more: prior?.loading_more ?? false,
          });
          return next;
        });
      });
  }, [is_authenticated, filters]);

  // Filter changes are orchestrated here (an event handler). Switching is just a
  // pointer move: the bootstrap effect fetches on a miss, and a cached window is
  // shown as-is — no clearing, no request, no seq bump (in-flight fetches for
  // the window the user left are allowed to land in that window's cache slot).
  // Full-replacement merge over the current filters; no-ops when nothing changed.
  const set_filters = useCallback((patch: Partial<TransactionsFilters>): void => {
    if (!is_authenticated_ref.current) return;
    const next: TransactionsFilters = { ...filters_ref.current, ...patch };
    if (filters_key(next) === filters_key(filters_ref.current)) return;
    filters_ref.current = next;
    setFilters(next);
  }, []);

  // Append the next page to the ACTIVE window's cache slot. Guarded against
  // overlapping fetches; the functional update writes the longer chain back so
  // depth survives leaving the window and returning later.
  const load_more = useCallback(async (): Promise<void> => {
    if (!is_authenticated_ref.current) return;
    const key = filters_key(filters_ref.current);
    const window = windows_ref.current.get(key);
    if (!window || window.loading_more) return;
    if (!window.has_next || !window.next_cursor) return;

    const seq = next_seq(request_seq.current, key);
    setWindows((prev) => {
      const existing = prev.get(key);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(key, { ...existing, loading_more: true });
      return next;
    });

    try {
      const page = await TransactionsAPI.list({
        ...window.filters,
        cursor: window.next_cursor,
        limit: PAGE_SIZE,
      });
      if (!is_authenticated_ref.current) return;
      if ((request_seq.current.get(key) ?? 0) !== seq) return;
      setWindows((prev) => {
        const existing = prev.get(key);
        if (!existing) return prev;
        const next = new Map(prev);
        next.set(key, {
          ...existing,
          entries: [...existing.entries, ...page.entries],
          next_cursor: page.next_cursor,
          has_next: page.has_next,
          error: null,
          loading_more: false,
        });
        return next;
      });
    } catch (err) {
      if (!is_authenticated_ref.current) return;
      if ((request_seq.current.get(key) ?? 0) !== seq) return;
      setWindows((prev) => {
        const existing = prev.get(key);
        if (!existing) return prev;
        const next = new Map(prev);
        next.set(key, {
          ...existing,
          error: error_message(err),
          loading_more: false,
        });
        return next;
      });
    } finally {
      if (
        is_authenticated_ref.current &&
        (request_seq.current.get(key) ?? 0) === seq
      ) {
        setWindows((prev) => {
          const existing = prev.get(key);
          if (!existing) return prev;
          const next = new Map(prev);
          next.set(key, { ...existing, loading_more: false });
          return next;
        });
      }
    }
  }, []);

  // Post-write refresh / manual retry.
  //
  // No args (error "Retry" buttons): reload the ACTIVE window's page 1 in place.
  //
  // With `touched_account_ids` (a successful log): the write can only have
  // changed the feeds of the accounts it touched plus the "All Accounts"
  // aggregate — so drop cached windows for exactly those, leave every other
  // account's loaded depth untouched, and refresh the active window in place if
  // it is one of the affected ones. Never throws.
  const refetch = useCallback(
    async (touched_account_ids?: string[] | null): Promise<void> => {
      if (!is_authenticated_ref.current) return;
      const current_key = filters_key(filters_ref.current);
      const current_filters = filters_ref.current;

      if (touched_account_ids && touched_account_ids.length > 0) {
        const affected = new Set(touched_account_ids);
        const active_affected =
          current_filters.account_id === null ||
          affected.has(current_filters.account_id ?? "");

        const to_drop: string[] = [];
        for (const [key, window] of windows_ref.current) {
          if (key === current_key) continue; // active handled below
          const account_id = window.filters.account_id;
          if (account_id === null || affected.has(account_id)) {
            to_drop.push(key);
          }
        }
        if (to_drop.length > 0) {
          setWindows((prev) => {
            const next = new Map(prev);
            for (const key of to_drop) next.delete(key);
            return next;
          });
          for (const key of to_drop) next_seq(request_seq.current, key);
        }
        if (!active_affected) return; // what the user is looking at is unaffected
      }

      // Refresh the active window's page 1 in place (keep rows visible while the
      // fresh page is fetched; swap on arrival). Creates the window if missing.
      const seq = next_seq(request_seq.current, current_key);
      setWindows((prev) => {
        const existing = prev.get(current_key);
        const next = new Map(prev);
        next.set(current_key, {
          ...(existing ?? empty_window(current_filters)),
          is_fetching: true,
          loading_more: false,
          error: null,
        });
        return next;
      });

      try {
        const page = await TransactionsAPI.list({
          ...current_filters,
          limit: PAGE_SIZE,
        });
        if (!is_authenticated_ref.current) return;
        if ((request_seq.current.get(current_key) ?? 0) !== seq) return;
        setWindows((prev) => {
          const existing = prev.get(current_key);
          if (!existing) return prev;
          const next = new Map(prev);
          next.set(current_key, {
            ...existing,
            entries: page.entries,
            next_cursor: page.next_cursor,
            has_next: page.has_next,
            error: null,
            is_fetching: false,
          });
          return next;
        });
      } catch (err) {
        if (!is_authenticated_ref.current) return;
        if ((request_seq.current.get(current_key) ?? 0) !== seq) return;
        setWindows((prev) => {
          const existing = prev.get(current_key);
          if (!existing) return prev;
          const next = new Map(prev);
          next.set(current_key, {
            ...existing,
            error: error_message(err),
            is_fetching: false,
          });
          return next;
        });
      }
    },
    [],
  );

  // The context exposes the ACTIVE window. Non-active windows may be loading or
  // appending in the background; their renders don't disturb the active slice.
  const value = useMemo<TransactionsContextValue>(() => {
    const active = windows.get(filters_key(filters));
    const entries = active?.entries ?? [];
    return {
      entries,
      next_cursor: active?.next_cursor ?? null,
      has_next: active?.has_next ?? false,
      loading:
        is_authenticated &&
        (active === undefined ||
          (active.entries.length === 0 && active.is_fetching)),
      is_refreshing:
        active !== undefined &&
        active.is_fetching &&
        active.entries.length > 0,
      loading_more: active?.loading_more ?? false,
      error: active?.error ?? null,
      filters,
      set_filters,
      load_more,
      refetch,
    };
  }, [windows, filters, is_authenticated, set_filters, load_more, refetch]);

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}
