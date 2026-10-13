import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DraftState {
  description: string;
  amount: string;
  date_iso: string | null; // null = never manually set, so use "now" at mount
  tag: string | null;

  setDescription: (v: string) => void;
  setAmount: (v: string) => void;
  setDate: (iso: string) => void;
  setTag: (name: string | null) => void;
  clear: () => void;
}

const EMPTY = { description: "", amount: "", date_iso: null, tag: null };

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...EMPTY,
      setDescription: (description) => set({ description }),
      setAmount: (amount) => set({ amount }),
      setDate: (date_iso) => set({ date_iso }),
      setTag: (tag) => set({ tag }),
      clear: () => set(EMPTY),
    }),
    {
      name: "spend-draft",
      version: 1,
      // persist data only, never the action functions
      partialize: ({ description, amount, date_iso, tag }) => ({ description, amount, date_iso, tag }),
    }
  )
);

export const selectHasDraft = (s: DraftState) =>
  s.description.trim().length > 0 || s.amount.length > 0 || s.date_iso !== null || s.tag !== null;