import { create } from "zustand";
import { ApiError } from "@/api/client";
import { Endpoints, type ListTransactionsResponse } from "@/api/endpoints";

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
	entry_id: string,
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
	filters: TransactionFilters,
	error: string | null,
	is_fetching: boolean,
	loading_more: boolean,
}

interface TransactionsState {
	data: Record<string, CachedTransactionWindow>,
	get_window: (filters: TransactionFilters) => CachedTransactionWindow,
	
	fetch: (filters: TransactionFilters) => Promise<void>,
	load_more: (filters: TransactionFilters) => Promise<void>
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

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
	data: {},

	get_window: (filters: TransactionFilters): CachedTransactionWindow => {
		const key = get_key(filters);
		return get().data[key];
	},

	fetch: async (filters: TransactionFilters) => {
		const key = get_key(filters);
		const seq = next_seq(filters);

		set((state) => {
			const existing = state.data[key];
			const update = existing
				? { ...existing, is_fetching: true, error: null }
				: { entries: [], filters, next_cursor: null, has_next: false, is_fetching: true, error: null, loading_more: false };
			return { data: { ...state.data, [key]: update } };
		});

		try {
			const data = await Endpoints.listTransactions({ ...filters });
			if (seq !== request_seq.get(key)) return;
			set((state) => ({
			  data: {
			    ...state.data,
			    [key]: {
			      entries: data.entries,
						filters,
			      next_cursor: data.next_cursor,
			      has_next: data.has_next,
			      is_fetching: false,
			      error: null,
						loading_more: false
			    },
			  },
			}));
		} catch (err) {
			if (seq !== request_seq.get(key)) return;
			set((state) => {
				const existing = state.data[key];
				const update = existing
					? { ...existing, is_fetching: false, error: ApiError.getErrorMessage(err) }
					: { entries: [], filters, next_cursor: null, has_next: false, is_fetching: false, error: ApiError.getErrorMessage(err), loading_more: false };
				return { data: { ...state.data, [key]: update } };
			});
		}
	},

	load_more: async (filters: TransactionFilters) => {
		const key = get_key(filters);
		const existing = get().data[key];
		
		if (!existing) {
			console.warn("load_more called with no existing window for key", key);
			return;
		}
		
		if (existing.loading_more) return;
		if (!existing.has_next || !existing.next_cursor) return;
		
		const seq = next_seq(filters);

		set((state) => ({
			data: { ...state.data, [key]: { ...existing, loading_more: true } }
		}));

		try {
			const data = await Endpoints.listTransactions({
				...filters,
				cursor: existing.next_cursor
			});
			
			if (seq !== request_seq.get(key)) return;
			
			set((state) => ({
				data: { ...state.data, [key]: {
					entries: [...existing.entries, ...data.entries],
					filters,
					next_cursor: data.next_cursor,
					has_next: data.has_next,
					is_fetching: false,
					error: null,
					loading_more: false
				}}
			}));
		} catch (err) {
			if (seq !== request_seq.get(key)) return;
			set((state) => ({
				data: { ...state.data, [key]: {
					...existing,
					loading_more: false,
					error: ApiError.getErrorMessage(err)
				}}
			}));
		}
	}
}));