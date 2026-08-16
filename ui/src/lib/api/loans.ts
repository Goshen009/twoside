import { apiFetch } from './client';
import type { Loan } from '../types';

export const getLoans = (params?: { status?: string; direction?: string }) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiFetch<{ loans: Loan[] }>(`/loans${query ? `?${query}` : ''}`);
};