import { useEffect, useState, type ReactNode } from "react";
import { AccountsContext } from "../useAccounts";
import type { Account } from "../useAccounts";

import API from "../../libs/api/api";

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
	const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetch_key, setRefetchKey] = useState(0);
  const [net_total, setNetTotal] = useState(0)

  useEffect(() => {
  	let active = true;

   	API.getBalances().then((data) => {
   		if (active) {
   			setAccounts(data.accounts);
     		setNetTotal(data.net_total);
      	setError(null);
     	}
    }).catch((err) => {
    	if (active)
   			setError(err instanceof Error ? err.message : "Failed to load accounts");
    }).finally(() => {
    	if (active)
   			setLoading(false);
    })

  	return () => {
   		active = false;
   	};
  }, [refetch_key]);
  
  const refetch = () => {
 		setLoading(true);
  	setRefetchKey((prev) => prev + 1);
  }
  
  return (
  	<AccountsContext.Provider value={{ accounts, loading, error, refetch, net_total, refetch_key }}>
   		{children}
   	</AccountsContext.Provider>
  );
}