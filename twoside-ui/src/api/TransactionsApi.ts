import { APIClient } from "@/api/client";
import type { LogExpensePayload } from "@/types/types";

export class TransactionsAPI {
  static async logExpense(payload: LogExpensePayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/expense", {
      method: "POST",
      body: payload,
    });
  }
}
