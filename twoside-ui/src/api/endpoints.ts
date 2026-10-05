import type { InfoData, TransactionsResponse } from "@/types/types";
import { APIClient } from "@/api/client";

export class Endpoints {
  static async getInfo(): Promise<InfoData> {
    const { data } = await APIClient.request<InfoData>("/info", { method: "GET" });
    return data;
  }

  static async getTransactions(tag_id?: string | null): Promise<TransactionsResponse> {
    const query = tag_id ? `?tag_id=${tag_id}` : "";
    const { data } = await APIClient.request<TransactionsResponse>(`/transactions${query}`, {
      method: "GET",
    });
    return data;
  }
}