import { useState } from 'react';
import { getAccountTransactions } from '../lib/api/transactions';

export function useTransactions() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAccountTransactions>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (accountId: string, startDate: string, endDate: string, page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAccountTransactions(accountId, { start_date: startDate, end_date: endDate, page });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetch };
}