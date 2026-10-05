import { create } from "zustand";

interface UIState {
  is_amounts_hidden: boolean;
  toggleAmountsHidden: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  is_amounts_hidden: false,
  toggleAmountsHidden: () => set((s) => ({ is_amounts_hidden: !s.is_amounts_hidden })),
}));