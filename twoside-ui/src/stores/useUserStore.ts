import { create } from 'zustand';
import { ApiError } from '@/api/client';
import { Endpoints } from '@/api/endpoints';
import { useAuthStore } from './useAuthStore';

export interface Account {
	id: string,
	name: string,
	balance: number,
	is_active: boolean
}

interface Category {
	id: string,
	name: string,
	is_active: boolean
}

interface Counterparty {
	id: string,
	name: string,
	is_active: boolean
}

export interface InfoData {
	username: string,
	currency_symbol: string,
	iana_timezone: string,
	total_balance: number,
	accounts: Account[],
	categories: Category[],
	counterparties: Counterparty[],
	total_you_owe: number,
	total_owed_to_you: number,
	open_loans: {
		id: string,
		amount: number,
		status: "OPEN" | "PARTIALLY_REPAID",
		direction: "GIVEN" | "BORROWED",
		date_issued: string // ISO string,
		counterparty_id: string,
		counterparty_name: string,
		total_repaid: number
	}[]
}

interface InfoState {
	data: InfoData | null,
	is_fetching: boolean,
	is_refreshing: boolean,
	error: string | null,

	fetch: () => Promise<void>;
	refetch: () => Promise<void>;
	reset: () => void;

	createCategory: (name: string) => Promise<void>;
  editCategory: (id: string, name: string, set_active: boolean) => Promise<void>;

  createCounterparty: (name: string) => Promise<void>;
  editCounterparty: (id: string, name: string, set_active: boolean) => Promise<void>;
}

// Ticket counter — module-level, not part of the store's state (it's an
// implementation detail, not something any component should read or react to).
let request_seq = 0;

export const useUserStore = create<InfoState>((set, get) => ({
	data: null,
	is_fetching: false,
  is_refreshing: false,
  error: null,
	
	fetch: async () => {
		const seq = ++request_seq;
    set({ is_fetching: true, error: null });

    try {
	   	const data = await Endpoints.getInfo();
			if (seq !== request_seq) return; // superseded — drop silently
			console.log('good');
			set({ data, error: null, is_fetching: false });
			console.log(get());
    } catch (err) {
   		if (seq !== request_seq) return;
     	console.log('err');
      set({ error: ApiError.getErrorMessage(err), is_fetching: false });
      console.log(get());
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
    set({ data: null, error: null, is_fetching: false, is_refreshing: false });
  },

  createCategory: async (name: string) => {
    await Endpoints.createCategory(name);
    await get().refetch();
  },
  
  editCategory: async (id: string, name: string, set_active: boolean) => {
    await Endpoints.editCategory(id, name, set_active);
    await get().refetch();
  },
  
  createCounterparty: async (name: string) => {
    await Endpoints.createCounterparty(name);
    await get().refetch();
  },
  
  editCounterparty: async (id: string, name: string, set_active: boolean) => {
    await Endpoints.editCounterparty(id, name, set_active);
    await get().refetch();
  },
}));

// React to auth transitions — this is the Option A pattern from earlier:
// a subscription set up once, outside any component.
useAuthStore.subscribe((state, prev_state) => {
  if (state.is_authenticated !== prev_state.is_authenticated) {
    if (state.is_authenticated) {
      useUserStore.getState().fetch();
    } else {
      useUserStore.getState().reset();
    }
  }
});