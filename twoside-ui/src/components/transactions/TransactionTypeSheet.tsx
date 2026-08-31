import { X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Landmark, HandCoins, ArrowRightLeft, CreditCard } from "lucide-react";
import { type TransactionType } from "../../libs/transaction-style";


type TransactionTypeSheetProps = {
  is_open: boolean;
  on_close: () => void;
  on_select_type: (type: TransactionType) => void;
};

export default function TransactionTypeSheet({ is_open, on_close, on_select_type }: TransactionTypeSheetProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${is_open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
      <div className="absolute inset-0" onClick={on_close} />
      <div className={`relative w-full max-w-md bg-surface border-t border-x border-white/10 rounded-t-3xl p-5 space-y-4 shadow-2xl transition-all duration-300 ease-out transform ${is_open ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-98"}`}>
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100">New Transaction</h3>
          <button onClick={on_close} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-mono text-muted/60 uppercase tracking-wider px-0.5">Core Actions</div>
          <div className="grid grid-cols-3 gap-2.5">
            <button onClick={() => on_select_type("expense")} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center text-center gap-2.5 hover:border-red-500/40 hover:bg-red-500/5 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform"><ArrowUpRight className="w-4 h-4" /></div>
              <span className="text-xs font-semibold text-zinc-200">Expense</span>
            </button>
            <button onClick={() => on_select_type("income")} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center text-center gap-2.5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><ArrowDownLeft className="w-4 h-4" /></div>
              <span className="text-xs font-semibold text-zinc-200">Income</span>
            </button>
            <button onClick={() => on_select_type("transfer")} className="p-3.5 rounded-2xl bg-black/20 border border-white/5 flex flex-col items-center text-center gap-2.5 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform"><ArrowLeftRight className="w-4 h-4" /></div>
              <span className="text-xs font-semibold text-zinc-200">Transfer</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-mono text-muted/60 uppercase tracking-wider px-0.5">Loans & Repayments</div>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => on_select_type("loan_given")} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left group">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform"><HandCoins className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">Give Loan</span>
            </button>
            <button onClick={() => on_select_type("loan_borrowed")} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left group">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform"><Landmark className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">Borrow</span>
            </button>
            <button onClick={() => on_select_type("loan_repay_received")} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform"><ArrowRightLeft className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">Receive Repayment</span>
            </button>
            <button onClick={() => on_select_type("loan_repay_paid")} className="p-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all text-left group">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-105 transition-transform"><CreditCard className="w-4 h-4" /></div>
              <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100">Repay Loan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}