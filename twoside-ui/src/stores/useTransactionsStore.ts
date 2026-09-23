import { create } from "zustand";
import { ApiError } from "@/api/client";
import { Endpoints, type ListTransactionsResponse } from "@/api/endpoints";
import { useAuthStore } from "./useAuthStore";

type TransactionLogType = 
	| "INCOME"
	| "EXPENSE"
	| "TRANSFER"
	| "GIVE_LOAN"
	| "BORROW"
	| "RECEIVE_REPAYMENT"
	| "REPAY_LOAN";

export interface TransactionFilters {
  account_id: string | null,
  category_id: string | null,
  // start_date: string | null, // YYYY-MM-DD
  // end_date: string | null, // YYYY-MM-DD
  // // TODO: include start_date/end_date in get_key when added
};

export interface TransactionEntry {
	account_id: string,
	account_name: string,
	is_active: boolean,
	side: 'DEBIT' | 'CREDIT',
	amount: number,
	charge_amount: number | null,
	log_type: TransactionLogType,
	transaction_date: string,
	date_logged: string,
	description: string,
	category_id: string | null,
	category_name: string | null,
	is_category_active: boolean | null,
	transaction_group_id: string,
	related_account?: { id: string, name: string },
	related_counterparty?: { id: string, name: string } | null
}

interface CachedTransactionWindow extends ListTransactionsResponse {
	is_loading: boolean,
	error: string | null,
	// then all those other fields.
}

interface TransactionsState {
	data: Record<string, CachedTransactionWindow>,
	
	fetch: (filters: TransactionFilters) => Promise<void>;
}

const request_seq = new Map<string, number>();   

const next_seq = (filters: TransactionFilters): number => {
	const key = get_key(filters);
	const seq = (request_seq.get(key) ?? 0) + 1;
	request_seq.set(key, seq);
	return seq;
};

const get_key = (filters: TransactionFilters): string => {
	return JSON.stringify([
		filters.account_id,
		filters.category_id
	]);
}

export const useTransactionsStore = create<TransactionsState>((set) => ({
	data: {},

	fetch: async (filters: TransactionFilters) => {
		const key = get_key(filters);
		const seq = next_seq(filters);

		set((state) => {
			const existing = state.data[key];
			const update = existing
				? { ...existing, is_loading: true, error: null }
				: { entries: [], next_cursor: null, has_next: false, is_loading: true, error: null };
			return { data: { ...state.data, [key]: update } };
		});

		try {
			const data = await Endpoints.listTransactions({
				account_id: filters.account_id ?? undefined,
				category_id: filters.category_id ?? undefined
			});
			if (seq !== request_seq.get(key)) return;
			set((state) => ({
			  data: {
			    ...state.data,
			    [key]: {
			      entries: data.entries,
			      next_cursor: data.next_cursor,
			      has_next: data.has_next,
			      is_loading: false,
			      error: null,
			    },
			  },
			}));
		} catch (err) {
			if (seq !== request_seq.get(key)) return;
			set((state) => {
				const existing = state.data[key];
				const update = existing
					? { ...existing, is_loading:false, error: ApiError.getErrorMessage(err) }
					: { entries: [], next_cursor: null, has_next: false, is_loading: false, error: ApiError.getErrorMessage(err) };
				return { data: { ...state.data, [key]: update } };
			});
		}
	},

	load_more: async (filters: TransactionFilters) => {
		const key = get_key(filters);
		const seq = next_seq(filters);

		set((state) => {
			const existing = state.data[key];
			const update = existing
				? { ...existing, is_loading: true, error: null }
				: { entries: [], next_cursor: null, has_next: false, is_loading: true, error: null };
			return { data: { ...state.data, [key]: update } };
		});

		try {
			const data = await Endpoints.listTransactions({
				account_id: filters.account_id ?? undefined,
				category_id: filters.category_id ?? undefined
			});
			if (seq !== request_seq.get(key)) return;
			set((state) => {
				const existing = state.data[key];
				const update = existing
					? { entries: [...existing.entries, ...data.entries ], next_cursor: data.next_cursor, has_next: data.has_next, is_loading: false, error: null }
					: { entries: data.entries,  next_cursor: data.next_cursor, has_next: data.has_next, is_loading: false, error: null };
				return { data: { ...state.data, [key]: update } };
			});
		} catch (err) {
			if (seq !== request_seq.get(key)) return;
			set((state) => {
				const existing = state.data[key];
				const update = existing
					? { ...existing, is_loading:false, error: ApiError.getErrorMessage(err) }
					: { entries: [], next_cursor: null, has_next: false, is_loading: false, error: ApiError.getErrorMessage(err) };
				return { data: { ...state.data, [key]: update } };
			});
		}
	}
}));