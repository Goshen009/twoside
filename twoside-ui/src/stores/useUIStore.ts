import { create } from "zustand";

type Overrides = Record<string, boolean>;

interface UIState {
  is_amounts_hidden: boolean;
  day_overrides: Overrides;
  toggleAmountsHidden: () => void;
  setDayOverrides: (next: Overrides | ((prev: Overrides) => Overrides)) => void;
}

export const useUIStore = create<UIState>((set) => ({
  is_amounts_hidden: false,
  day_overrides: {},
  toggleAmountsHidden: () => set((s) => ({ is_amounts_hidden: !s.is_amounts_hidden })),
  setDayOverrides: (next) =>
    set((s) => ({ day_overrides: typeof next === "function" ? next(s.day_overrides) : next })),
}));