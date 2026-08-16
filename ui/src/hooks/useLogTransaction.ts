import { useState } from 'react';
import { logTransaction } from '../lib/api/transactions';
import type { TransactionPayload } from '../lib/types';

export function useLogTransaction() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (payload: TransactionPayload) => {
    setSubmitting(true);
    setError(null);
    try {
      return await logTransaction(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to log transaction';
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}