import { useTransactionsCache } from "./useTransactionsCache";
import { useEffect, useState } from "react";

import API from "../libs/api/api";

export interface AccountSummary {
  account_id: string | null,
  account_name: string | null,
  start_date: string,
  end_date: string,
  opening_balance: number,
  closing_balance: number,
  net_change: number,
  total_in: number,
  total_out: number,
};

const ALL_TIME_START = "2000-01-01";
const todayStr = () => new Date().toISOString().slice(0, 10);

export const useAccountSummary = (account_id: string, start_date: string, end_date: string) => {
	const cache = useTransactionsCache();
	const key = `${account_id}|${start_date}|${end_date}`;
	const cached = cache.getSummary(key) ?? null;

  const [summary, setSummary] = useState<AccountSummary | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [synced_key, setSyncedKey] = useState(key);

  // key changed since the last render → resync summary/loading for the new
  // key right now, during render, instead of in an effect.
  if (key !== synced_key) {
    setSyncedKey(key);
    setSummary(cached);
    setLoading(!cached);
  }
  
  useEffect(() => {
  	if (cached) return;
   
  	let active = true;
    API.getSummary({ 
    	account_id: account_id !== "all" ? account_id : undefined,
     	start_date: start_date || ALL_TIME_START,
      end_date: end_date || todayStr()
    }).then((data) => {
    	if (active) {
   			setSummary(data);
     		setLoading(false);
      	cache.setSummary(key, data);
     	}
    })

    return () => {
      active = false;
    };
  }, [key, cached, account_id, start_date, end_date, cache]);

  return { summary, loading };
};