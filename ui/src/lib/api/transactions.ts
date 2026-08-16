import { apiFetch } from './client';
import type { TransactionPayload } from '../types';

export const logTransaction = (payload: TransactionPayload) =>
  apiFetch<{ transaction_group_id: string }>('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const getAccountTransactions = (
  accountId: string,
  params: { start_date: string; end_date: string; with_balances?: boolean; page?: number; limit?: number }
) => {
  const query = new URLSearchParams({
    start_date: params.start_date,
    end_date: params.end_date,
    with_balances: String(params.with_balances ?? true),
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 25),
  });
  return apiFetch<{
    account_id: string;
    account_name: string;
    opening_balance?: number;
    closing_balance?: number;
    is_account_disabled: boolean;
    entries: {
      id: string;
      side: 'DEBIT' | 'CREDIT';
      amount: number;
      trx_date: string;
      description: string;
      category_name: string | null;
    }[];
    pagination: { total: number; page: number; limit: number; total_pages: number; has_next: boolean; has_prev: boolean };
  }>(`/transactions/${accountId}?${query}`);
};