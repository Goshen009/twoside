import { AccountBalance, TransactionType, ValidationErrorField } from "./types";

// Simulated mock database state
const mockAccounts: AccountBalance[] = [
  { account_id: "fe1bb118-ef7c-4c3e-8b79-4a0990bab74e", name: "Cash", balance: 12700 },
  { account_id: "29b86351-9272-41f8-8be1-7ddcb0e49fdf", name: "Bank", balance: 19000 },
  { account_id: "77c86351-9272-41f8-8be1-7ddcb0e49fcc", name: "Savings", balance: 150000 },
];

export class APIError extends Error {
  status: number;
  fields?: ValidationErrorField[];

  constructor(status: number, message: string, fields?: ValidationErrorField[]) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const api = {
  async getBalances(): Promise<{ balances: AccountBalance[] }> {
    // Simulate slight network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { balances: mockAccounts };
  },

  async logTransaction(type: TransactionType, payload: any): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Simulate conditional soft warning test case (e.g. if amount > 50000 on expense without bypass)
    if (type === "expense" && !payload.bypass_warnings && payload.sources?.[0]?.amount > 50000) {
      throw new APIError(400, "Validation Errors", [
        { field: "sources", message: "Expense amount exceeds available balance in account." },
        { field: "trx_date", message: "Warning: Transaction date is set in the distant past." }
      ]);
    }

    // Success response simulation
    return { message: "Successful" };
  }
};