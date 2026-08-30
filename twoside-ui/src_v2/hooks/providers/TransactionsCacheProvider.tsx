import { CachedList, TransactionsCacheContext } from "../useTransactionsCache";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { AccountSummary } from "../useAccountSummary";
import { useAccounts } from "../useAccounts";

export const TransactionsCacheProvider = ({ children }: { children: ReactNode }) => {
  const summary_cache = useRef(new Map<string, AccountSummary>());
  const list_cache = useRef(new Map<string, CachedList>());
  
	const { refetch_key } = useAccounts();
  const prev_refetch_key = useRef(refetch_key);

  useEffect(() => {
 		if (refetch_key !== prev_refetch_key.current) {
      summary_cache.current.clear();
      list_cache.current.clear();
      prev_refetch_key.current = refetch_key;
    }
  }, [refetch_key]);

  const value = useMemo(
  	() => ({
 			getSummary: (key: string) => summary_cache.current.get(key),
      setSummary: (key: string, val: AccountSummary) => { summary_cache.current.set(key, val); },
      getList: (key: string) => list_cache.current.get(key),
      setList: (key: string, val: CachedList) => { list_cache.current.set(key, val); },
   	}),
   	[]
  );
	
  return (
    <TransactionsCacheContext.Provider value={value}>
      {children}
    </TransactionsCacheContext.Provider>
  );
};