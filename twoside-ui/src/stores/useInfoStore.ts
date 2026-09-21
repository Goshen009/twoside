import { create } from 'zustand';
import { ApiError } from '@/api/client';
import { Endpoints } from '@/api/endpoints';
import { useAuthStore } from './useAuthStore';

export interface InfoData {
	currency_symbol: string,
	iana_timezone: string,
	accounts: { id: string, name: string, balance: number }[],
	categories: { id: string, name: string }[],
	counterparties: { id: string, name: string }[],
	total_you_owe: number,
	total_owed_to_you: number,
	open_loans: {
		id: string,
		amount: number,
		status: "OPEN" | "PARTIALLY_REPAID",
		direction: "GIVEN" | "BORROWED",
		date_issues: string // ISO string,
		counterparty_id: string,
		counterparty_name: string,
		total_repaid: number
	}
}

interface InfoState {
	data: InfoData | null,
	is_loading: boolean,
	is_refreshing: boolean,
	error: string | null,

	fetch: () => Promise<void>;
	refetch: () => Promise<void>;
	reset: () => void;
}

// Ticket counter — module-level, not part of the store's state (it's an
// implementation detail, not something any component should read or react to).
let request_seq = 0;

export const useInfoStore = create<InfoState>((set) => ({
	data: null,
	is_loading: false,
  is_refreshing: false,
  error: null,
	
	fetch: async () => {
		const seq = ++request_seq;
    set({ is_loading: true, error: null });

    try {
	   	const data = await Endpoints.getInfo();
			if (seq !== request_seq) return; // superseded — drop silently
			set({ data, error: null, is_loading: false });
    } catch (err) {
   		if (seq !== request_seq) return;
      set({ error: ApiError.getErrorMessage(err), is_loading: false });
    }
	},

	refetch: async () => {
    const seq = ++request_seq;
    set({ is_refreshing: true });
	
    try {
      const data = await Endpoints.getInfo();
      if (seq !== request_seq) return;
      set({ data, error: null, is_refreshing: false });
    } catch (err) {
      if (seq !== request_seq) return;
      set({ error: ApiError.getErrorMessage(err), is_refreshing: false });
    }
  },

  reset: () => {
  	request_seq++; // invalidate anything currently in flight
    set({ data: null, error: null, is_loading: false, is_refreshing: false });
  },
}));

// React to auth transitions — this is the Option A pattern from earlier:
// a subscription set up once, outside any component.
useAuthStore.subscribe((state, prev_state) => {
  if (state.is_authenticated !== prev_state.is_authenticated) {
    if (state.is_authenticated) {
      useInfoStore.getState().fetch();
    } else {
      useInfoStore.getState().reset();
    }
  }
});