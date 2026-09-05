import { APIClient } from "@/api/client";
import type {
  LogBorrowPayload,
  LogExpensePayload,
  LogGiveLoanPayload,
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

  static async logGiveLoan(payload: LogGiveLoanPayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/loan", {
      method: "POST",
      body: payload,
    });
  }

  static async logBorrow(payload: LogBorrowPayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/borrow", {
      method: "POST",
      body: payload,
    });
  }
}
