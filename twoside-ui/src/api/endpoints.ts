import { APIClient } from "@/api/client";

export class Endpoints {
	static async requestOtp(email: string): Promise<void> {
    const { response } = await APIClient.request<{ message: string }>("/auth/request-otp", {
      method: "POST",
      use_auth: false,
      body: { email },
    });
    APIClient.setAccessToken(APIClient.extractAccessToken(response));
  }

  static async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const { response, data } = await APIClient.request<VerifyOtpResponse>("/auth/request-otp", {
      method: "POST",
      use_auth: false,
      body: { email, otp },
    });
    APIClient.setAccessToken(APIClient.extractAccessToken(response));
    return data;
  }

  static async logout(): Promise<void> {
    try {
      await APIClient.request<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      APIClient.setAccessToken(null);
    }
  }
}

type VerifyOtpResponse = {
	requires_onboarding: boolean;
}