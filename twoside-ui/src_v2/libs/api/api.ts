import { Account } from "../../hooks/useAccounts";
import { AccountSummary } from "../../hooks/useAccountSummary";
import { CachedList } from "../../hooks/useTransactionsCache";
import APIClient from "./cilent";

class API {
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
	  search.set("limit", String(params.limit ?? 25));
			
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
}

const extractAccessToken = (response: Response): string => {
	const header = response.headers.get("Authorization");
  if (!header)
		throw new Error("No Authorization header returned by server");
	return header.replace(/^Bearer\s+/i, "");
}

export default API;