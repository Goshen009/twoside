"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Landmark, HandCoins, ArrowRightLeft, CreditCard } from "lucide-react";
import { AccountBalance, TransactionType } from "@/lib/types";
import { api } from "@/lib/api";
import BalanceCarousel from "@/components/modules/BalanceCarousel";
import TransactionFormModal from "@/components/modules/TransactionForm";

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [activeModalType, setActiveModalType] = useState<TransactionType | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      try {
        const data = await api.getBalances();
        setAccounts(data.balances);
      } catch (err) {
        console.error("Failed to load balances", err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    fetchBalances();
  }, []);

  return (
    <div className="p-4 space-y-3 pb-12">
      {loadingAccounts ? (
        <div className="bg-surface/80 border border-white/5 rounded-2xl p-6 text-center text-muted text-xs animate-pulse">
          Loading accounts...
        </div>
      ) : (
        <BalanceCarousel accounts={accounts} />
      )}

      {/* Primary Actions Grid (Expense, Income, Transfer) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() => setActiveModalType("expense")}
          className="p-4 rounded-2xl bg-surface/80 border border-white/5 flex flex-col items-start gap-3 hover:border-primary/40 transition-all group shadow-lg text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shadow-inner">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100">Expense</div>
            <div className="text-[10px] text-muted mt-0.5">Record money going out</div>
          </div>
        </button>

        <button
          onClick={() => setActiveModalType("income")}
          className="p-4 rounded-2xl bg-surface/80 border border-white/5 flex flex-col items-start gap-3 hover:border-primary/40 transition-all group shadow-lg text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-inner">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100">Income</div>
            <div className="text-[10px] text-muted mt-0.5">Record money coming in</div>
          </div>
        </button>
      </div>

      <button
        onClick={() => setActiveModalType("transfer")}
        className="w-full p-3.5 rounded-2xl bg-surface/80 border border-white/5 flex items-center justify-between hover:border-primary/40 transition-all group shadow-lg text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform shadow-inner">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100">Transfer</div>
            <div className="text-[10px] text-muted">Move funds between your accounts</div>
          </div>
        </div>
      </button>

      {/* Subtle Separator */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-white/5"></div>
        <span className="flex-shrink mx-3 text-[10px] text-muted/60 uppercase tracking-widest font-mono">Loans & Repayments</span>
        <div className="flex-grow border-t border-white/5"></div>
      </div>

      {/* Secondary Actions Grid (The 4 Loan Types) */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveModalType("loan_given")}
          className="p-3 rounded-2xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-primary/40 transition-all group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <HandCoins className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-200">Loan Given</div>
            <div className="text-[9px] text-muted">Lend out funds</div>
          </div>
        </button>

        <button
          onClick={() => setActiveModalType("loan_borrowed")}
          className="p-3 rounded-2xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-primary/40 transition-all group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Landmark className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-200">Borrowing</div>
            <div className="text-[9px] text-muted">Receive a loan</div>
          </div>
        </button>

        <button
          onClick={() => setActiveModalType("loan_repay_received")}
          className="p-3 rounded-2xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-primary/40 transition-all group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-200">Repay In</div>
            <div className="text-[9px] text-muted">Loan collection</div>
          </div>
        </button>

        <button
          onClick={() => setActiveModalType("loan_repay_paid")}
          className="p-3 rounded-2xl bg-surface/60 border border-white/5 flex items-center gap-2.5 hover:border-primary/40 transition-all group text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-200">Repay Out</div>
            <div className="text-[9px] text-muted">Pay back loan</div>
          </div>
        </button>
      </div>

      {/* Transaction Form Modal Sheet */}
      {activeModalType && (
        <TransactionFormModal
          isOpen={!!activeModalType}
          onClose={() => setActiveModalType(null)}
          accounts={accounts}
          initialType={activeModalType}
        />
      )}
    </div>
  );
}