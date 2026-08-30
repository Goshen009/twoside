import ApiClient from "./client";
import Format from "../format";
import type { AccountSummary, JournalEntry } from "@/lib/types";

type RawJournalEntry = Omit<JournalEntry, "amount"> & { amount: number | string };

type RawSummary = Omit<AccountSummary, "opening_balance" | "closing_balance" | "net_change" | "total_in" | "total_out"> & {
  opening_balance: number | string;
  closing_balance: number | string;
  net_change: number | string;
  total_in: number | string;
  total_out: number | string;
};

type ListTransactionsResponse = {
  entries: JournalEntry[];
  next_cursor: string | null;
  has_next: boolean;
};

class TransactionsApi {
  static async getSummary(params: {
    account_id?: string;
    start_date: string;
    end_date: string;
  }): Promise<AccountSummary> {
    const search = new URLSearchParams();
    if (params.account_id) search.set("account_id", params.account_id);
    search.set("start_date", params.start_date);
    search.set("end_date", params.end_date);

    const { data } = await ApiClient.request<RawSummary>(`/accounts/summary?${search.toString()}`);
    return {
      ...data,
      opening_balance: Format.toNumber(data.opening_balance),
      closing_balance: Format.toNumber(data.closing_balance),
      net_change: Format.toNumber(data.net_change),
      total_in: Format.toNumber(data.total_in),
      total_out: Format.toNumber(data.total_out),
    };
  }

  static async list(params: {
    account_id?: string;
    category_id?: string | null;
    start_date?: string;
    end_date?: string;
    cursor?: string | null;
    limit?: number;
  } = {}): Promise<ListTransactionsResponse> {
    const search = new URLSearchParams();
    if (params.account_id) search.set("account_id", params.account_id);
    if (params.category_id) search.set("category_id", params.category_id);
    if (params.start_date) search.set("start_date", params.start_date);
    if (params.end_date) search.set("end_date", params.end_date);
    if (params.cursor) search.set("cursor", params.cursor);
    search.set("limit", String(params.limit ?? 25));

    const { data } = await ApiClient.request<{ entries: RawJournalEntry[]; next_cursor: string | null; has_next: boolean }>(
      `/accounts/transactions?${search.toString()}`
    );
    return {
      entries: data.entries.map((e) => ({ ...e, amount: Format.toNumber(e.amount) })),
      next_cursor: data.next_cursor,
      has_next: data.has_next,
    };
  }

  static async logExpense(payload: {
    description: string;
    trx_date: string;
    category_id: string | null;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await ApiClient.request("/log/expense", { method: "POST", body: payload });
  }

  static async logIncome(payload: {
    description: string;
    trx_date: string;
    destinations: { account_id: string; amount: number }[];
  }): Promise<void> {
    await ApiClient.request("/log/income", { method: "POST", body: payload });
  }
  
  static async logTransfer(payload: {
    description: string;
    trx_date: string;
    from_account_id: string;
    to_account_id: string;
    amount: number;
    bypass_warnings: boolean;
  }): Promise<void> {
    await ApiClient.request("/log/transfer", { method: "POST", body: payload });
  }

  static async logGiveLoan(payload: {
    description: string;
    trx_date: string;
    counterparty_id: string;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await ApiClient.request("/log/loan", { method: "POST", body: payload });
  }
  
  static async logBorrow(payload: {
    description: string;
    trx_date: string;
    counterparty_id: string;
    destinations: { account_id: string; amount: number }[];
  }): Promise<void> {
    await ApiClient.request("/log/borrow", { method: "POST", body: payload });
  }

  static async logReceiveRepayment(payload: {
    description: string;
    trx_date: string;
    loan_id: string;
    destinations: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await ApiClient.request("/log/borrow-returned", { method: "POST", body: payload });
  }
  
  static async logRepayLoan(payload: {
    description: string;
    trx_date: string;
    loan_id: string;
    sources: { account_id: string; amount: number }[];
    bypass_warnings: boolean;
  }): Promise<void> {
    await ApiClient.request("/log/loan-repayed", { method: "POST", body: payload });
  }
}

export default TransactionsApi;