import { useEffect, useState } from 'react';
import { getCounterparties, createCounterparty } from '../lib/api/counterparties';
import type { Counterparty } from '../lib/types';

export function useCounterparties() {
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCounterparties();
      setCounterparties(data.counterparties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load counterparties');
    } finally {
      setLoading(false);
    }
  };

  const create = async (name: string) => {
    await createCounterparty(name);
    await refresh();
  };

  useEffect(() => {
    let ignore = false;

    getCounterparties()
      .then((data) => {
        if (!ignore) setCounterparties(data.counterparties);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load counterparties');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  return { counterparties, loading, error, refresh, create };
}