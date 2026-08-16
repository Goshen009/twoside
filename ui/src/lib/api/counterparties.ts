import { apiFetch } from './client';
import type { Counterparty } from '../types';

export const getCounterparties = (showDisabled = false) =>
  apiFetch<{ counterparties: Counterparty[] }>(`/counterparties?show_disabled=${showDisabled}`);

export const createCounterparty = (name: string) =>
  apiFetch<{ id: string }>('/counterparties', { method: 'POST', body: JSON.stringify({ name }) });