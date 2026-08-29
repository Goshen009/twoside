import ApiClient from "./client";
import Format from "../format";
import type { Account } from "@/lib/types";

type RawBalancesResponse = {
  balances: { account_id: string; name: string; balance: number | string }[];
  net_total: number | string;
};

class AccountsApi {
  static async getBalances(): Promise<{ accounts: Account[]; net_total: number }> {
    const { data } = await ApiClient.request<RawBalancesResponse>("/balances");
    return {
      accounts: data.balances.map((b) => ({
        id: b.account_id,
        name: b.name,
        balance: Format.toNumber(b.balance),
      })),
      net_total: Format.toNumber(data.net_total),
    };
  }
}

export default AccountsApi;