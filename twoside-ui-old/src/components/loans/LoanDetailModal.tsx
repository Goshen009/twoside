// import React from "react";
import { type LoanItem } from "../../data/loansDummyData";
import Format from "@/libs/format";
import { X, Calendar, ArrowDownLeft, Building2 } from "lucide-react";

interface LoanDetailModalProps {
  loan: LoanItem;
  onClose: () => void;
}

export function LoanDetailModal({ loan, onClose }: LoanDetailModalProps) {
  const outstanding = loan.amount - loan.total_repaid;
  const is_lent = loan.direction === "LENT";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm p-3">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              {is_lent ? "Lent Details" : "Borrowing Details"}
            </span>
            <h3 className="text-sm font-bold text-zinc-100">{loan.counterparty_name}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Card */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted">Total Principal Amount:</span>
            <span className="font-mono font-semibold text-zinc-200">₦{Format.formatMoney(loan.amount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted">Total Repaid:</span>
            <span className="font-mono font-semibold text-emerald-400">₦{Format.formatMoney(loan.total_repaid)}</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
            <span className="text-muted font-medium">Outstanding Balance:</span>
            <span className="font-mono font-bold text-zinc-100 text-sm">₦{Format.formatMoney(outstanding)}</span>
          </div>
        </div>

        {/* Repayment History Stream */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted px-0.5">
            Repayment Events ({loan.repayments.length})
          </div>

          {loan.repayments.length === 0 ? (
            <div className="bg-black/20 border border-white/5 rounded-xl p-6 text-center text-muted text-xs">
              No repayments recorded yet for this loan.
            </div>
          ) : (
            loan.repayments.map((rep) => (
              <div key={rep.id} className="bg-black/20 border border-white/5 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs font-medium text-zinc-200 truncate">{rep.description}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {Format.formatDate(rep.date_repaid)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />
                        {rep.bank_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    +₦{Format.formatMoney(rep.amount)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}