import { APIClient } from "@/api/client";
import type {
  LogBorrowPayload,
  LogExpensePayload,
  LogGiveLoanPayload,
  LogIncomePayload,
  LogReceiveRepaymentPayload,
  LogRepayLoanPayload,
  LogTransferPayload,
  TransactionsListQuery,
  TransactionsPage,
} from "@/types/types";

export class TransactionsAPI {
  static async list(query: TransactionsListQuery): Promise<TransactionsPage> {
    const params = new URLSearchParams();
    if (query.account_id) params.set("account_id", query.account_id);
    if (query.category_id) params.set("category_id", query.category_id);
    if (query.start_date) params.set("start_date", query.start_date);
    if (query.end_date) params.set("end_date", query.end_date);
    if (query.cursor) params.set("cursor", query.cursor);
    params.set("limit", String(query.limit));
    const { data } = await APIClient.request<TransactionsPage>(
      `/accounts/transactions?${params.toString()}`,
      { method: "GET" },
    );
    return data;
  }

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

  static async logRepayLoan(payload: LogRepayLoanPayload): Promise<void> {
    await APIClient.request<{ message: string }>("/log/loan-repayed", {
      method: "POST",
      body: payload,
    });
  }

  static async logReceiveRepayment(
    payload: LogReceiveRepaymentPayload,
  ): Promise<void> {
    await APIClient.request<{ message: string }>("/log/borrow-returned", {
      method: "POST",
      body: payload,
    });
  }
}
