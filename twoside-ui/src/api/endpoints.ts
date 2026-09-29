import { APIClient } from "@/api/client";
import type { TransactionEntry, TransactionLogType } from "@/stores/useTransactionsStore";
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

  static async listTransactions(params: {
  	cursor?: string,
    account_id?: string,
    category_id?: string,
    start_date?: string,
    end_date?: string
  }, limit?: number): Promise<ListTransactionsResponse> {
  	const query_params = new URLSearchParams();
    if (limit) query_params.set("limit", String(limit));
    
   	for (const [key, value] of Object.entries(params)) {
    	if (value) query_params.set(key, value); 
    }
    
  	const { data } = await APIClient.request<ListTransactionsResponse>(`/transactions?${query_params.toString()}`, { method: 'GET' });
   	return data;
  }

  static async log<T extends TransactionLogType>(type: T, payload: LogPayloadByType[T], bypass_warnings: string[]): Promise<void> {
		await APIClient.request<{ message: string }>(LOG_PATHS[type], {
			method: "POST",
			body: { ...payload, bypass_warnings },
		});
  }
}

const LOG_PATHS: Record<TransactionLogType, string> = {
	EXPENSE: "/log/expense",
	INCOME: "/log/income",
	TRANSFER: "/log/transfer",
	GIVE_LOAN: "/log/loan",
	BORROW: "/log/borrow",
	REPAY_LOAN: "/log/loan-repayed",
	RECEIVE_REPAYMENT: "/log/borrow-returned",
};

export interface AccountAllocation {
  account_id: string;
  amount: number;
  charge: number;
}

interface CommonPayload {
  description: string;
  transaction_date: string; // UTC ISO
}

export interface LogExpensePayload extends CommonPayload {
  category_name: string | null;
  sources: AccountAllocation[];
}

export interface LogIncomePayload extends CommonPayload {
  destinations: AccountAllocation[];
}

export interface LogTransferPayload extends CommonPayload {
  amount: number;
  charge: number;
  from_account_id: string;
  to_account_id: string;
}

export interface LogGiveLoanPayload extends CommonPayload {
  counterparty_name: string;
  sources: AccountAllocation[];
}

export interface LogBorrowPayload extends CommonPayload {
  counterparty_name: string;
  destinations: AccountAllocation[];
}

export interface LogRepayLoanPayload extends CommonPayload {
  loan_id: string;
  sources: AccountAllocation[];
}

export interface LogReceiveRepaymentPayload extends CommonPayload {
  loan_id: string;
  destinations: AccountAllocation[];
}

export type LogPayloadByType = {
  EXPENSE: LogExpensePayload;
  INCOME: LogIncomePayload;
  TRANSFER: LogTransferPayload;
  GIVE_LOAN: LogGiveLoanPayload;
  BORROW: LogBorrowPayload;
  REPAY_LOAN: LogRepayLoanPayload;
  RECEIVE_REPAYMENT: LogReceiveRepaymentPayload;
};

export interface ListTransactionsResponse {
	entries: TransactionEntry[],
	next_cursor: string | null,
	has_next: boolean
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