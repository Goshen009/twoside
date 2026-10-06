import { create } from "zustand";
import { ApiError } from "@/api/client";
import { Endpoints } from "@/api/endpoints";
import type { Day } from "@/types/types";

interface TransactionsState {
  days: Day[] | null; // null until the first successful load
  tag_id: string | null;
  is_fetching: boolean;
  is_refreshing: boolean;
  error: string | null;

  fetch: (tag_id?: string | null) => Promise<void>; // shows skeleton
  refetch: () => Promise<void>; // silent, keeps current data on screen
  reset: () => void;
}

let request_seq = 0;

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  days: null,
  tag_id: null,
  is_fetching: false,
  is_refreshing: false,
  error: null,

  fetch: async (tag_id = null) => {
    const seq = ++request_seq;
    set({ tag_id, is_fetching: true, error: null });
    
    try {
      const { days } = await Endpoints.getTransactions(tag_id);
      if (seq !== request_seq) return;
      set({ days, is_fetching: false });
    } catch (err) {
      if (seq !== request_seq) return;
      set({ error: ApiError.getErrorMessage(err), is_fetching: false });
    }
  },

  refetch: async () => {
    const seq = ++request_seq;
    set({ is_refreshing: true });
    try {
      const { days } = await Endpoints.getTransactions(get().tag_id);
      if (seq !== request_seq) return;
      set({ days, error: null, is_fetching: false, is_refreshing: false });
    } catch {
      if (seq !== request_seq) return;
      set({ is_refreshing: false });
    }
  },

  reset: () => {
    request_seq++;
    set({ days: null, tag_id: null, is_fetching: false, is_refreshing: false, error: null });
  },
}));