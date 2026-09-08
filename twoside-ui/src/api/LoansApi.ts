import { APIClient } from "@/api/client";
import type { LoansListQuery, LoansPage } from "@/types/types";

export class LoansAPI {
  static async list(query: LoansListQuery): Promise<LoansPage> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.direction) params.set("direction", query.direction);
    if (query.counterparty_id) params.set("counterparty_id", query.counterparty_id);
    if (query.cursor) params.set("cursor", query.cursor);
    params.set("limit", String(query.limit));
    const { data } = await APIClient.request<LoansPage>(
      `/loans?${params.toString()}`,
      { method: "GET" },
    );
    return data;
  }
}
