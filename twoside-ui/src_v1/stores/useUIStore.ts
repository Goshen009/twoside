import { create } from "zustand";

const AMOUNTS_HIDDEN_KEY = "amount_hidden";

interface UIState {
	is_amounts_hidden: boolean;
  toggleAmountsHidden: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  is_amounts_hidden: localStorage.getItem(AMOUNTS_HIDDEN_KEY) === "true",
  
  toggleAmountsHidden: () =>
    set((state) => {
      const next = !state.is_amounts_hidden;
      localStorage.setItem(AMOUNTS_HIDDEN_KEY, String(next));
      return { is_amounts_hidden: next };
    }),
}));