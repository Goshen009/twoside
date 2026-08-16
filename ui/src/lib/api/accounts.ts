import { apiFetch } from './client';
import type { Account } from '../types';

export const getAccounts = (showDisabled = false) =>
  apiFetch<{ accounts: Account[] }>(`/accounts?show_disabled=${showDisabled}`);