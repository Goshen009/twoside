import { create } from "zustand";
import { useTransactionsStore, type TransactionLogType } from "@/stores/useTransactionsStore";
import { APIClient, ApiError } from "@/api/client";
import { useUserStore } from "./useUserStore";

interface AddTransactionState {
  is_open: boolean;
  error: string | null;
  is_submitting: boolean;
  selected_type: TransactionLogType | null; // null = the picker is showing
  warnings: { code: string, message: string } | null,
  accepted_warnings: string[] | null,
  
  open: () => void;
  close: () => void;
  choose: (type: TransactionLogType) => void;
  back: () => void;
  submit: (request: (bypass_warnings: string[]) => Promise<void>, touched_account_ids: string[], bypass: string | null) => Promise<boolean>;
}

export const useAddTransactionStore = create<AddTransactionState>((set, get) => ({
  error: null,
  is_open: false,
  selected_type: null,
  is_submitting: false,
  warnings: null,
  accepted_warnings: null,
  
  open: () => set({ is_open: true, selected_type: null, error: null }),
  
  choose: (selected_type) => set({ selected_type, error: null }),
  
  close: () => set({ is_open: false }), // don't reset the type here, or the sheet flickers mid-exit
  
  back: () => set({ selected_type: null }),

  // unrelated, it's starting to feel like spaghetti.
  submit: async (request, touched_account_ids, bypass) => {
  	if (get().is_submitting) return false;

   	if (bypass && !get().accepted_warnings.includes(bypass))
    	set({ accepted_warnings: [ ...get().accepted_warnings, bypass ] });

    set({ is_submitting: true, error: null, warnings: null });
    try {
      await request(get().accepted_warnings ?? []);
    } catch (err) {
    	set({ is_submitting: false });
    	if (err instanceof ApiError && err.status === 409 && err.extensions?.type === 'WARNING') {
     		set({ warnings: { code: String(err.extensions.code), message: err.message }});
     	} else {
      	set({ error: ApiError.getErrorMessage(err) });
      }
      return false;
    }
    set({ is_submitting: false, is_open: false });
    useUserStore.getState().refetch(); // balances, open loans, any new category or counterparty
    useTransactionsStore.getState().invalidate(touched_account_ids);
    return true;

    // this whole return true and return false thingy too
    // hmmm.
  },
}));