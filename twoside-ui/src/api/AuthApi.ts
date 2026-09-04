import { APIClient } from "@/api/client";

export class AuthAPI {
  static async login(username: string, password: string): Promise<void> {
    const { response } = await APIClient.request<{ message: string }>("/auth/login", {
      method: "POST",
      body: { username, password },
      use_auth: false,
    });
    APIClient.setAccessToken(APIClient.extractAccessToken(response));
  }

  static async register(username: string, password: string): Promise<void> {
    const { response } = await APIClient.request<{ message: string }>("/auth/register", {
      method: "POST",
      body: { username, password },
      use_auth: false,
    });
    APIClient.setAccessToken(APIClient.extractAccessToken(response));
  }

  static async logout(): Promise<void> {
    try {
      await APIClient.request<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      APIClient.setAccessToken(null);
    }
  }
}
