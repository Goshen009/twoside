import { APIClient } from "@/api/client";
import type { InfoData } from "@/stores/useUserStore";

export class Endpoints {
	static async requestOtp(email: string): Promise<void> {
    await APIClient.request<{ message: string }>("/auth/request-otp", {
      method: "POST",
      use_auth: false,
      body: { email },
    });
  }

  static async login(email: string, otp: string): Promise<VerifyOtpResponse> {
    const { response, data } = await APIClient.request<VerifyOtpResponse>("/auth/login", {
      method: "POST",
      use_auth: false,
      body: { email, otp },
    });

    if (isVerifyOTPSuccess(data)) {
    	APIClient.setAccessToken(APIClient.extractAccessToken(response));
    }
    return data;
  }

  static async register(email: string, otp: string): Promise<VerifyOtpResponse> {
    const { response, data } = await APIClient.request<VerifyOtpResponse>("/auth/register", {
      method: "POST",
      use_auth: false,
      body: { email, otp },
    });

    if (isVerifyOTPSuccess(data)) {
    	APIClient.setAccessToken(APIClient.extractAccessToken(response));
    }
    return data;
  }

  static async confirmPending(): Promise<VerifyOtpSuccess> {
    const { response, data } = await APIClient.request<VerifyOtpSuccess>("/auth/confirm-pending", {
      method: "POST",
      use_auth: false,
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

  static async setProfile(username: string, iana_timezone: string, currency_symbol: string) {
    return APIClient.request<{ message: string }>("/profile", {
      method: "POST",
      body: { username, iana_timezone, currency_symbol },
    });
  }

  static async getInfo(): Promise<InfoData> {
  	const { data } = await APIClient.request<InfoData>("/info", { method: 'GET' });
   	return data;
  }

  static async createCategory(category_name: string): Promise<void> {
  	await APIClient.request("/category", { 
   		method: 'POST',
     	body: { category_name }
   	});
  }

  static async editCategory(id:string, category_name: string, set_active: boolean): Promise<void> {
  	await APIClient.request(`/category/${id}`, { 
   		method: 'PATCH',
     	body: { 
      	category_name,
       	set_active: set_active ? 'true' : 'false'
      }
   	});
  }

  static async createCounterparty(counterparty_name: string): Promise<void> {
  	await APIClient.request("/counterparty", { 
   		method: 'POST',
     	body: { counterparty_name }
   	});
  }

  static async editCounterparty(id:string, counterparty_name: string, set_active: boolean): Promise<void> {
  	await APIClient.request(`/counterparty/${id}`, { 
   		method: 'PATCH',
     	body: { 
      	counterparty_name,
       	set_active: set_active ? 'true' : 'false'
      }
   	});
  }
}

export interface VerifyOtpSuccess {
  status: "FULLY_REGISTERED" | "REQUIRES_ONBOARDING";
  email: string;
  refresh_token?: string;
}

interface VerifyOtpPending {
  status: "NOT_FOUND" | "ALREADY_EXISTING";
}

export type VerifyOtpResponse = VerifyOtpSuccess | VerifyOtpPending;

export const isVerifyOTPSuccess = (result: VerifyOtpResponse): result is VerifyOtpSuccess =>
  result.status === "FULLY_REGISTERED" || result.status === "REQUIRES_ONBOARDING";