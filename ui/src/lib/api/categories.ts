import { apiFetch } from './client';
import type { Category } from '../types';

export const getCategories = (showDisabled = false) =>
  apiFetch<{ categories: Category[] }>(`/categories?show_disabled=${showDisabled}`);

export const createCategory = (name: string) =>
  apiFetch<{ id: string }>('/categories', { method: 'POST', body: JSON.stringify({ name }) });