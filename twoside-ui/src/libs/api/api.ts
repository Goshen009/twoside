import { type Account } from "../../hooks/useAccounts";
import { type AccountSummary } from "../../hooks/useAccountSummary";
import { type Category } from "../../hooks/useCategories";
import { type Counterparty } from "../../hooks/useCounterparties";
import { type Loan, type LoanDirection, type LoanStatus } from "../../hooks/useLoans";
import { type CachedList } from "../../hooks/useTransactionsCache";
import APIClient from "./cilent";

class API {
	static async login(username: string, pin: string): Promise<void> {
	  const { response } = await APIClient.request("/auth/login", {
	    method: "POST",
	    body: { username, pin },
	    use_auth: false,
	  });
	  APIClient.setAccessToken(extractAccessToken(response));
	}
	
	static async register(username: string, pin: string, confirm_pin: string): Promise<void> {
	  const { response } = await APIClient.request("/auth/register", {
	    method: "POST",
	    body: { username, pin, confirm_pin },
	    use_auth: false,
	  });
	  APIClient.setAccessToken(extractAccessToken(response));
	}
	
	static async refrshSession(): Promise<boolean> {
		try { 
			const { response } = await APIClient.request("/auth/refresh", { method: 'POST', use_auth: false });
			APIClient.setAccessToken(extractAccessToken(response));
			return true;
		} catch {
			 return false;
		}
	}

	static async logout() {
		try {
			await APIClient.request("/auth/logout", { method: 'POST' })
		} finally {
			APIClient.setAccessToken(null);
		}
	}

	static async getBalances(): Promise<{ accounts: Account[], net_total: number }> {
		const { data } = await APIClient.request<{
			balances: { account_id: string, name: string, balance: number }[]
			net_total: number
		}>("/balances", { method: 'GET' });
		
		return {
			accounts: data.balances.map((b) => ({
				id: b.account_id,
				name: b.name,
				balance: b.balance
			})),
			net_total: data.net_total
		};
	}

	static async getSummary(params: {
		account_id?: string,
		start_date: string,
		end_date: string
	}): Promise<AccountSummary> {
		const search = new URLSearchParams();
		search.set("start_date", params.start_date);
    search.set("end_date", params.end_date);

    if (params.account_id)
    	search.set("account_id", params.account_id);

    const { data } = await APIClient.request<AccountSummary>(`/accounts/summary?${search.toString()}`, { method: 'GET' });
    return data;
	}

	static async listTransactions(params: {
    account_id?: string;
    category_id?: string | null;
    start_date?: string;
    end_date?: string;
    cursor?: string | null;
    limit?: number;
  } = {}): Promise<CachedList> {
	 	const search = new URLSearchParams();
	  search.set("limit", String(params.limit ?? 2));
			
	  if (params.account_id) 
			search.set("account_id", params.account_id);
	  if (params.category_id) 
			search.set("category_id", params.category_id);
	  if (params.start_date) 
			search.set("start_date", params.start_date);
	  if (params.end_date) 
			search.set("end_date", params.end_date);
	  if (params.cursor) 
			search.set("cursor", params.cursor);

		const { data } = await APIClient.request<CachedList>(`/accounts/transactions?${search.toString()}`, { method: 'GET' });
		return data;
  }

  static async listCategories(show_inactive: boolean = true): Promise<Category[]> {
    const { data } = await APIClient.request<{ categories: Category[] }>(
      `/categories?show_inactive=${show_inactive}`,
      { method: "GET" }
    );
    return data.categories;
  }
  
  static async createCategory(name: string): Promise<Category> {
    const { data } = await APIClient.request<Category>("/categories", {
      method: "POST",
      body: { name },
    });
    return data;
  }
  
  static async listCounterparties(show_inactive: boolean = true): Promise<Counterparty[]> {
    const { data } = await APIClient.request<{ counterparties: Counterparty[] }>(
      `/counterparties?show_inactive=${show_inactive}`,
      { method: "GET" }
    );
    return data.counterparties;
  }
  
  static async createCounterparty(name: string): Promise<Counterparty> {
    const { data } = await APIClient.request<Counterparty>("/counterparties", {
      method: "POST",
      body: { name },
    });
    return data;
  }

  static async logExpense(payload: {
    description: string;
    transaction_date: string;
    category_id: string | null;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await APIClient.request("/log/expense", { method: "POST", body: payload });
  }
  
  static async logIncome(payload: {
    description: string;
    transaction_date: string;
    destinations: { account_id: string; amount: number }[];
  }): Promise<void> {
    await APIClient.request("/log/income", { method: "POST", body: payload });
  }
  
  static async logTransfer(payload: {
    description: string;
    transaction_date: string;
    from_account_id: string;
    to_account_id: string;
    amount: number;
    bypass_warnings: boolean;
  }): Promise<void> {
    await APIClient.request("/log/transfer", { method: "POST", body: payload });
  }

  static async logGiveLoan(payload: {
    description: string;
    transaction_date: string;
    counterparty_id: string;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await APIClient.request("/log/loan", { method: "POST", body: payload });
  }
  
  static async logBorrow(payload: {
    description: string;
    transaction_date: string;
    counterparty_id: string;
    destinations: { account_id: string; amount: number }[];
  }): Promise<void> {
    await APIClient.request("/log/borrow", { method: "POST", body: payload });
  }
  
  static async logReceiveRepayment(payload: {
    description: string;
    transaction_date: string;
    loan_id: string;
    destinations: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await APIClient.request("/log/borrow-returned", { method: "POST", body: payload });
  }

  static async logRepayLoan(payload: {
    description: string;
    transaction_date: string;
    loan_id: string;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await APIClient.request("/log/loan-repayed", { method: "POST", body: payload });
  }
  
  static async listLoans(params: { direction?: LoanDirection; status?: LoanStatus } = {}): Promise<Loan[]> {
    const search = new URLSearchParams();
    if (params.direction) search.set("direction", params.direction);
    if (params.status) search.set("status", params.status);
    const { data } = await APIClient.request<{ loans: Loan[] }>(`/loans?${search.toString()}`, { method: "GET" });
    return data.loans;
  }
}

const extractAccessToken = (response: Response): string => {
	const header = response.headers.get("Authorization");
  if (!header)
		throw new Error("No Authorization header returned by server");
	return header.replace(/^Bearer\s+/i, "");
}

export default API;