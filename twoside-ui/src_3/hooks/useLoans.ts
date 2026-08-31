import { useEffect, useState } from "react";
import LoansApi from "@/lib/api/loans";
import type { Loan, LoanDirection } from "@/lib/types";

export function useLoans(direction: LoanDirection) {
  const [loans, set_loans] = useState<Loan[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => { if (active) set_loading(true); });
    LoansApi.list({ direction })
      .then((data) => {
        if (active) set_loans(data.filter((l) => l.status !== "CLOSED"));
      })
      .finally(() => { if (active) set_loading(false); });
    return () => { active = false; };
  }, [direction]);

  return { loans, loading };
}