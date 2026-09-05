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
import { InfoAPI } from "@/api/InfoApi";
import { useAuth } from "@/hooks/useAuth";
import type { InfoContextValue, InfoData } from "@/types/types";

function error_message(err: unknown): string {
  return err instanceof Error
    ? err.message
    : "Something went wrong. Please try again.";
}

// eslint-disable-next-line react-refresh/only-export-components
export const InfoContext = createContext<InfoContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useInfo(): InfoContextValue {
  const ctx = useContext(InfoContext);
  if (!ctx) throw new Error("useInfo must be used within InfoProvider");
  return ctx;
}

export function InfoProvider({ children }: { children: ReactNode }) {
  const { is_authenticated } = useAuth();

  const [data, setData] = useState<InfoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [is_fetching, setIsFetching] = useState(false);

  const request_seq = useRef(0);
  const is_authenticated_ref = useRef(is_authenticated);

  useEffect(() => {
    is_authenticated_ref.current = is_authenticated;
    // Bump on every auth transition (mount included): invalidates any in-flight
    // request from a previous session so a stale completion can't repopulate the
    // cache after the render-phase reset below has cleared it.
    request_seq.current++;
  }, [is_authenticated]);

  // React to session transitions during render instead of in an effect: on login
  // mark the upcoming bootstrap fetch as in-flight; on logout drop the cache.
  // Adjusting state during render (guarded by the prev-value comparison, so it
  // runs once per transition) is the React-sanctioned alternative to calling
  // setState inside useEffect.
  const [prev_authenticated, setPrevAuthenticated] = useState(is_authenticated);
  if (prev_authenticated !== is_authenticated) {
    setPrevAuthenticated(is_authenticated);
    setData(null);
    setError(null);
    setIsFetching(is_authenticated);
  }

  // Bootstrap: fetch /info once per login session. The `request_seq` guard
  // drops the response if a newer request or a logout started while it was in
  // flight, so a stale completion can't overwrite fresher data.
  useEffect(() => {
    if (!is_authenticated) return;

    const seq = ++request_seq.current;
    InfoAPI.getInfo()
      .then((info) => {
        if (seq !== request_seq.current || !is_authenticated_ref.current) return;
        setData(info);
        setError(null);
        setIsFetching(false);
      })
      .catch((err) => {
        if (seq !== request_seq.current || !is_authenticated_ref.current) return;
        setError(error_message(err));
        setIsFetching(false);
      });
  }, [is_authenticated]);

  // Explicit refresh — call sites await this after a successful write. Always
  // issues a fresh GET /info; stale completions are dropped via `request_seq`.
  // Never throws; failures fold into `error`.
  const refetch = useCallback(async (): Promise<void> => {
    const seq = ++request_seq.current;
    setIsFetching(true);
    try {
      const info = await InfoAPI.getInfo();
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setData(info);
      setError(null);
    } catch (err) {
      if (seq !== request_seq.current || !is_authenticated_ref.current) return;
      setError(error_message(err));
    } finally {
      if (seq === request_seq.current) setIsFetching(false);
    }
  }, []);

  const value = useMemo<InfoContextValue>(
    () => ({
      data,
      loading: is_fetching && data === null,
      is_refreshing: is_fetching && data !== null,
      error,
      refetch,
    }),
    [data, error, is_fetching, refetch],
  );

  return <InfoContext.Provider value={value}>{children}</InfoContext.Provider>;
}
