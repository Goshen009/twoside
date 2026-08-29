import type { BalancesResponse } from "@/lib/types";

export const mockBalances: BalancesResponse = {
  balances: [
    { account_id: "fe1bb118-ef7c-4c3e-8b79-4a0990bab74e", name: "Cash", balance: 12700 },
    { account_id: "29b86351-9272-41f8-8be1-7ddcb0e49fdf", name: "Bank", balance: 19000 },
    { account_id: "b3a1d0a2-1234-4a3e-8b79-4a0990bab74e", name: "Savings", balance: 55000 },
  ],
};