import { APIClient } from "@/api/client";
import type { InfoData } from "@/types/types";

export class InfoAPI {
  static async getInfo(): Promise<InfoData> {
    const { data } = await APIClient.request<InfoData>("/info", { method: "GET" });
    return data;
  }
}
