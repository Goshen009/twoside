// import React from "react";
import { type LoanItem } from "../../data/loansDummyData";
import Format from "@/libs/format";
import { HandCoins, Landmark } from "lucide-react";

interface LoansFeedProps {
  loans: LoanItem[];
  onSelectLoan: (loan: LoanItem) => void;
}

export function LoansFeed({ loans, onSelectLoan }: LoansFeedProps) {
  if (loans.length === 0) {
    return (
      <div className="bg-surface/80 border border-white/5 rounded-2xl p-10 text-center text-muted text-xs">
        No loan records found in this view.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {loans.map((loan) => {
        const outstanding = loan.amount - loan.total_repaid;
        const is_lent = loan.direction === "LENT";

        return (
          <div
            key={loan.id}
            onClick={() => onSelectLoan(loan)}
            className="w-full bg-surface/90 border border-white/5 rounded-2xl p-3.5 flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer text-left group"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                is_lent ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                {is_lent ? <HandCoins className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold text-zinc-100 truncate group-hover:text-primary transition-colors">
                  {loan.counterparty_name}
                </div>
                <div className="text-[10px] text-muted font-mono">
                  {Format.formatDate(loan.date_issued)}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-mono font-bold text-zinc-100">
                ₦{Format.formatMoney(outstanding)}
              </div>
              <div className="text-[10px] text-muted/70 font-mono">
                of ₦{Format.formatMoney(loan.amount)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}