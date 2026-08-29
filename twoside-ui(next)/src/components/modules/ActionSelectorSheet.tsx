"use client";

import { X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Landmark, HandCoins, ArrowRightLeft, CreditCard } from "lucide-react";
import { TransactionType } from "@/lib/types";

interface ActionSelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: TransactionType) => void;
}

export default function ActionSelectorSheet({ isOpen, onClose, onSelectType }: ActionSelectorSheetProps) {
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-3 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Container with smooth slide-up/slide-down transition */}
      <div 
        className={`relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl transition-all duration-300 ease-out transform ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100">New Transaction</h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Actions Section */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-muted/60 uppercase tracking-widest">Core Actions</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSelectType("expense")}
              className="p-3 rounded-2xl bg-surface/80 border border-white/5 flex flex-col items-center text-center gap-2 hover:border-red-500/40 hover:bg-red-500/5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-200">Expense</span>
            </button>

            <button
              onClick={() => onSelectType("income")}
              className="p-3 rounded-2xl bg-surface/80 border border-white/5 flex flex-col items-center text-center gap-2 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-200">Income</span>
            </button>

            <button
              onClick={() => onSelectType("transfer")}
              className="p-3 rounded-2xl bg-surface/80 border border-white/5 flex flex-col items-center text-center gap-2 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-zinc-200">Transfer</span>
            </button>
          </div>
        </div>

        {/* Loans & Repayments Section */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-mono text-muted/60 uppercase tracking-widest">Loans & Repayments</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectType("loan_given")}
              className="p-2.5 rounded-xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <HandCoins className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100">Loan Given</span>
            </button>

            <button
              onClick={() => onSelectType("loan_borrowed")}
              className="p-2.5 rounded-xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-amber-500/40 transition-all text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100">Borrowing</span>
            </button>

            <button
              onClick={() => onSelectType("loan_repay_received")}
              className="p-2.5 rounded-xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-emerald-500/40 transition-all text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100">Repay In</span>
            </button>

            <button
              onClick={() => onSelectType("loan_repay_paid")}
              className="p-2.5 rounded-xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-rose-500/40 transition-all text-left group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-zinc-100">Repay Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}