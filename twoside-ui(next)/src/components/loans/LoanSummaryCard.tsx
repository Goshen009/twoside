"use client";

interface LoanSummaryCardProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export function LoanSummaryCard({ totalOwedToMe, totalIOwe }: LoanSummaryCardProps) {
  return (
    <div className="space-y-3">
      {/*<div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">Loans & Liabilities</h1>
          <p className="text-[10px] text-muted">Track money lent out and obligations owed</p>
        </div>
      </div>*/}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] text-muted block font-mono uppercase tracking-wider">Total Owed To Me</span>
          <span className="text-sm font-mono font-bold text-emerald-400">₦{totalOwedToMe.toLocaleString()}</span>
        </div>
        <div className="bg-black/30 p-3 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[10px] text-muted block font-mono uppercase tracking-wider">Total I Owe</span>
          <span className="text-sm font-mono font-bold text-rose-400">₦{totalIOwe.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}