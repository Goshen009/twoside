import { useEffect, useState } from 'react';
import { getLoans } from '../lib/api/loans';
import type { Loan } from '../lib/types';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoans();
      setLoans(data.loans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    getLoans()
      .then((data) => {
        if (!ignore) setLoans(data.loans);
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Failed to load loans');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  return { loans, loading, error, refresh };
}