import { create } from "zustand";
import type { TransactionLogType } from "@/stores/useTransactionsStore";

interface AddTransactionState {
	is_open: boolean;
	selected_type: TransactionLogType | null; // null = the picker is showing
	open: () => void;
	close: () => void;
	choose: (type: TransactionLogType) => void;
	back: () => void;
}

export const useAddTransactionStore = create<AddTransactionState>((set) => ({
	is_open: false,
	selected_type: null,

	open: () => set({ is_open: true, selected_type: null }),
	choose: (selected_type) => set({ selected_type }),
	close: () => set({ is_open: false }), // don't reset the type here, or the sheet flickers mid-exit
	back: () => set({ selected_type: null }),
}));