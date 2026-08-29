"use client";

import { User } from "lucide-react";

interface RepaymentRow {
  id: string;
  date: string;
  amount: number;
  description: string;
  accountName: string;
}

interface LoanRow {
  id: string;
  counterparty: string;
  description: string;
  date: string;
  amount: number;
  type: "given" | "received";
  status: "unpaid" | "partial" | "paid";
  repaidAmount: number;
  repayments: RepaymentRow[];
}

interface LoanCardProps {
  loan: LoanRow;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  formatDate: (dateStr: string) => string;
}

export function LoanCard({ loan, isExpanded, onToggleExpand, formatDate }: LoanCardProps) {
  const remaining = loan.amount - loan.repaidAmount;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium">PAID</span>;
      case "partial":
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-medium">PARTIAL</span>;
      case "unpaid":
      default:
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-medium">UNPAID</span>;
    }
  };

  return (
    <div
      className={`bg-surface/90 border rounded-2xl transition-all ${
        isExpanded ? "border-primary/40 bg-surface shadow-lg" : "border-white/5 hover:border-white/10"
      }`}
    >
      <div
        onClick={() => onToggleExpand(loan.id)}
        className="p-3.5 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          {/*<div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <User className="w-4 h-4" />
          </div>*/}

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100 truncate">{loan.counterparty}</span>
              {/*{getStatusBadge(loan.status)}*/}
            </div>
            <div className="text-[11px] text-zinc-300 truncate">{loan.description}</div>
            <div className="flex items-center gap-2 text-[10px] text-muted font-sans">
              <span>{formatDate(loan.date)}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          <div className="text-xs font-mono font-bold text-zinc-100">
            ₦{loan.amount.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-muted">
            {loan.status === "paid" ? (
              <span className="text-emerald-400 font-medium">Paid</span>
            ) : (
              <span>Bal: ₦{remaining.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-2 border-t border-white/5 bg-black/20 rounded-b-2xl space-y-2.5">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider pt-1">
            Repayment History
          </div>

          {loan.repayments.length === 0 ? (
            <div className="text-center py-4 text-[11px] text-muted bg-surface/45 rounded-xl border border-white/5">
              No repayments recorded for this loan yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {loan.repayments.map((rep) => (
                <div key={rep.id} className="flex items-center justify-between text-xs bg-surface/60 px-3 py-2 rounded-xl border border-white/5">
                  <div className="space-y-0.5 pr-2">
                    <div className="text-zinc-200 font-sans text-xs font-medium">{rep.description}</div>
                    <div className="text-[10px] text-muted font-sans">
                      {formatDate(rep.date)}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-emerald-400 font-mono font-bold">+₦{rep.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-sans text-primary">{rep.accountName}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-muted text-[11px]">Total Repaid So Far:</span>
            <span className="font-mono font-semibold text-zinc-200">₦{loan.repaidAmount.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}