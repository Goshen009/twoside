import type { InfoData, EditPayload, RecordPayload, TransactionsResponse } from "@/types/types";
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
  
  static async record(payload: RecordPayload): Promise<void> {
    await APIClient.request<object>("/transaction", { method: "POST", body: payload });
  }

  static async editTransaction(id: string, patch: EditPayload): Promise<void> {
    await APIClient.request<object>(`/transaction/${id}`, {
      method: "PATCH",
      body: patch,
    });
  }
  
  static async deleteTransaction(id: string): Promise<void> {
    await APIClient.request<object>(`/transaction/${id}`, { method: "DELETE" });
  }

  static async renameTag(tag_id: string, name: string): Promise<void> {
    await APIClient.request<object>(`/tag/${tag_id}`, {
      method: "PATCH",
      body: { tag: name },
    });
  }
  
  static async deleteTag(tag_id: string): Promise<void> {
    await APIClient.request<object>(`/tag/${tag_id}`, { method: "DELETE" });
  }

  static async mergeTag(tag_id: string, target_tag_id: string): Promise<void> {
    await APIClient.request<object>(`/tag/${tag_id}/merge`, {
      method: "POST",
      body: { target_tag_id },
    });
  }

  static async getGoogleAuthUrl(): Promise<string> {
    const { data } = await APIClient.request<{ url: string }>("/google/auth-url", {
      method: "GET",
      use_auth: false,
    });
    return data.url;
  }
  
  static async googleCallback(code: string, state: string): Promise<void> {
    const { response } = await APIClient.request<object>("/google/callback", {
      method: "POST",
      body: { code, state },
      use_auth: false,
    });
    APIClient.setAccessToken(APIClient.extractAccessToken(response));
  }
  
  static async logout(): Promise<void> {
    await APIClient.request<object>("/logout", { method: "POST", use_auth: false });
  }

  static async editInfo(patch: { name?: string }): Promise<void> {
    await APIClient.request<object>("/info", { method: "PATCH", body: patch });
  }
}