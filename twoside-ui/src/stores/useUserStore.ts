import { create } from "zustand";
import { ApiError } from "@/api/client";
import { Endpoints } from "@/api/endpoints";
import type { InfoData } from "@/types/types";

interface UserState {
  data: InfoData | null;
  is_fetching: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  reset: () => void;
}

let request_seq = 0;

export const useUserStore = create<UserState>((set) => ({
  data: null,
  is_fetching: false,
  error: null,

  fetch: async () => {
    const seq = ++request_seq;
    set({ is_fetching: true, error: null });
    
    try {
      const data = await Endpoints.getInfo();
      if (seq !== request_seq) return;
      set({ data, is_fetching: false });
    } catch (err) {
      if (seq !== request_seq) return;
      set({ error: ApiError.getErrorMessage(err), is_fetching: false });
    }
  },

  reset: () => {
    request_seq++;
    set({ data: null, error: null, is_fetching: false });
  },
}));