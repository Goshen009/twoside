import { APIClient } from "@/api/client";
import type {
  LogExpensePayload,
  LogIncomePayload,
  LogTransferPayload,
} from "@/types/types";

export class TransactionsAPI {
  static async logExpense(payload: LogExpensePayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/expense", {
      method: "POST",
      body: payload,
    });
  }

  static async logIncome(payload: LogIncomePayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/income", {
      method: "POST",
      body: payload,
    });
  }

  static async logTransfer(payload: LogTransferPayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/transfer", {
      method: "POST",
      body: payload,
    });
  }
}
