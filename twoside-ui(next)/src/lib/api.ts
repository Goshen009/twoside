import { AccountBalance } from "./types";

export const api = {
  async getBalances(): Promise<{ balances: AccountBalance[] }> {
    // Replace with your real fetch implementation
    return {
      balances: [
        { id: "1", name: "Cash", balance: 0, currency: "NGN" },
        { id: "2", name: "Bank", balance: 0, currency: "NGN" },
        { id: "3", name: "Savings", balance: 0, currency: "NGN" },
      ],
    };
  },
};