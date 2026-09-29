import { create } from "zustand";
import { useTransactionsStore, type TransactionLogType } from "@/stores/useTransactionsStore";
import { ApiError } from "@/api/client";
import { useUserStore } from "./useUserStore";

interface AddTransactionState {
  is_open: boolean;
  error: string | null;
  is_submitting: boolean;
  selected_type: TransactionLogType | null; // null = the picker is showing
  open: () => void;
  close: () => void;
  choose: (type: TransactionLogType) => void;
  back: () => void;
  submit: (request: () => Promise<void>, touched_account_ids: string[]) => Promise<boolean>;
}

export const useAddTransactionStore = create<AddTransactionState>((set, get) => ({
  error: null,
  is_open: false,
  selected_type: null,
  is_submitting: false,
  
  open: () => set({ is_open: true, selected_type: null, error: null }),
  
  choose: (selected_type) => set({ selected_type, error: null }),
  
  close: () => set({ is_open: false }), // don't reset the type here, or the sheet flickers mid-exit
  
  back: () => set({ selected_type: null }),
  
  submit: async (request, touched_account_ids) => {
  	if (get().is_submitting) return false;
   
    set({ is_submitting: true, error: null });
    try {
      await request();
    } catch (err) {
      set({ is_submitting: false, error: ApiError.getErrorMessage(err) });
      return false;
    }
    set({ is_submitting: false, is_open: false });
    useUserStore.getState().refetch(); // balances, open loans, any new category or counterparty
    useTransactionsStore.getState().invalidate(touched_account_ids);
    return true;
  },
}));