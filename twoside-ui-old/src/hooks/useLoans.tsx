import { useEffect, useState } from "react";
import API from "../libs/api/api";

export type LoanDirection = "GIVEN" | "BORROWED";
export type LoanStatus = "OPEN" | "PARTIALLY_REPAID" | "CLOSED";

export interface Loan {
  id: string;
  direction: LoanDirection;
  status: LoanStatus;
  amount: number;
  counterparty_name: string;
  date_issued: string;
  total_repaid: number;
}

export const useLoans = (direction: LoanDirection) => {
  const [loans, set_loans] = useState<Loan[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let active = true;
    set_loading(true);
    API.listLoans({ direction })
      .then((data) => {
        if (active) set_loans(data.filter((l) => l.status !== "CLOSED"));
      })
      .finally(() => {
        if (active) set_loading(false);
      });
    return () => {
      active = false;
    };
  }, [direction]);

  return { loans, loading };
};