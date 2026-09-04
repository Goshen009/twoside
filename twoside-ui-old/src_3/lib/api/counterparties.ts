import ApiClient from "./client";
import type { Counterparty } from "@/lib/types";

type ListCounterpartiesResponse = { counterparties: Counterparty[] };

class CounterpartiesApi {
  static async list(show_inactive: boolean = true): Promise<Counterparty[]> {
    const { data } = await ApiClient.request<ListCounterpartiesResponse>(
      `/counterparties?show_inactive=${show_inactive}`
    );
    return data.counterparties;
  }

  static async create(name: string): Promise<Counterparty> {
    const { data } = await ApiClient.request<Counterparty>("/counterparties", {
      method: "POST",
      body: { name },
    });
    return data;
  }
}

export default CounterpartiesApi;