import ApiClient from "./client";
import Format from "../format";
import type { Loan, LoanDirection, LoanStatus } from "@/lib/types";

type RawLoan = Omit<Loan, "amount" | "total_repaid"> & {
  amount: number | string;
  total_repaid: number | string;
};

class LoansApi {
  static async list(params: { direction?: LoanDirection; status?: LoanStatus } = {}): Promise<Loan[]> {
    const search = new URLSearchParams();
    if (params.direction) search.set("direction", params.direction);
    if (params.status) search.set("status", params.status);
    const { data } = await ApiClient.request<{ loans: RawLoan[] }>(`/loans?${search.toString()}`);
    return data.loans.map((l) => ({
      ...l,
      amount: Format.toNumber(l.amount),
      total_repaid: Format.toNumber(l.total_repaid),
    }));
  }
}

export default LoansApi;