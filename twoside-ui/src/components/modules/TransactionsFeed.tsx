"use client";

import { useState } from "react";
import { Search, Calendar, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ChevronRight, Wallet, Filter, SlidersHorizontal } from "lucide-react";

interface TransactionRow {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: "expense" | "income" | "transfer" | "loan_given" | "loan_borrowed" | "loan_repay_received" | "loan_repay_paid";
  accountName: string;
  categoryName?: string;
  isExpanded?: boolean;
}

const MOCK_TRANSACTIONS: TransactionRow[] = [
  { id: "1", description: "Grocery store pickup", date: "2026-08-27", amount: 15400, type: "expense", accountName: "Bank", categoryName: "Groceries" },
  { id: "2", description: "Client freelance payment", date: "2026-08-26", amount: 120000, type: "income", accountName: "Bank", categoryName: "Freelance" },
  { id: "3", description: "Transfer to Savings", date: "2026-08-25", amount: 50000, type: "transfer", accountName: "Bank" },
  { id: "4", description: "Emergency loan given to John", date: "2026-08-24", amount: 25000, type: "loan_given", accountName: "Cash" },
  { id: "5", description: "Transport to Lekki", date: "2026-08-23", amount: 3500, type: "expense", accountName: "Cash", categoryName: "Transport" },
];

export default function TransactionsFeed() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isSummaryActive, setIsSummaryActive] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>("1");

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-24">
      {/* Top Header & Asset Account Selector Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: "all", label: "All Accounts" },
            { id: "cash", label: "Cash" },
            { id: "bank", label: "Bank" },
            { id: "savings", label: "Savings" },
          ].map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedAccount === acc.id
                  ? "bg-primary text-black font-semibold shadow-lg shadow-primary/20"
                  : "bg-surface/80 border border-white/5 text-muted hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {acc.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Jump to Date button */}
          <button className="p-2 rounded-xl bg-surface/80 border border-white/5 text-muted hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Jump to Date</span>
          </button>
          {/* Date Range Picker trigger */}
          <button 
            onClick={() => setIsSummaryActive(!isSummaryActive)}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs ${
              isSummaryActive ? "bg-primary/10 border-primary/30 text-primary" : "bg-surface/80 border-white/5 text-muted"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Range Summary</span>
          </button>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search transactions by description..."
          className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Account Summary Card (Triggered by Date Range) */}
      {isSummaryActive && (
        <div className="bg-surface/80 border border-white/10 rounded-2xl p-4 space-y-3 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted uppercase tracking-wider pb-2 border-b border-white/5">
            <span>Summary: Bank Account</span>
            <span>Aug 01, 2026 – Aug 27, 2026</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] font-mono text-muted block uppercase">Opening</span>
              <span className="text-xs font-mono font-bold text-zinc-200">₦245,000.00</span>
            </div>
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] font-mono text-emerald-400/80 block uppercase">Total In</span>
              <span className="text-xs font-mono font-bold text-emerald-400">+₦450,000.00</span>
            </div>
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] font-mono text-rose-400/80 block uppercase">Total Out</span>
              <span className="text-xs font-mono font-bold text-rose-400">-₦180,500.00</span>
            </div>
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
              <span className="text-[10px] font-mono text-muted block uppercase">Closing</span>
              <span className="text-xs font-mono font-bold text-zinc-100">₦514,500.00</span>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Stream (Infinite Scroll Row List) */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-muted uppercase tracking-wider px-1">Recent Activity</div>

        {MOCK_TRANSACTIONS.map((trx) => {
          const isExpanded = expandedId === trx.id;
          return (
            <div
              key={trx.id}
              className={`bg-surface/90 border rounded-2xl transition-all ${
                isExpanded ? "border-primary/40 bg-surface shadow-lg" : "border-white/5 hover:border-white/10"
              }`}
            >
              {/* Main Row Clickable */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : trx.id)}
                className="p-3 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                      trx.type === "income"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : trx.type === "expense"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : trx.type === "transfer"
                        ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                        : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                    }`}
                  >
                    {trx.type === "income" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs font-medium text-zinc-100 truncate">{trx.description}</div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
                      <span>{trx.date}</span>
                      <span>•</span>
                      <span className="text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded-md">{trx.accountName}</span>
                      {trx.categoryName && (
                        <>
                          <span>•</span>
                          <span className="text-primary/90">{trx.categoryName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs font-mono font-bold ${
                      trx.type === "income" ? "text-emerald-400" : trx.type === "expense" ? "text-zinc-100" : "text-sky-400"
                    }`}
                  >
                    {trx.type === "income" ? "+" : "-"}₦{trx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Journal Entry Slide-Over / Accordion Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-black/20 rounded-b-2xl space-y-2 animate-in slide-in-from-top-1 duration-150">
                  <div className="text-[10px] font-mono text-muted uppercase tracking-wider pt-1">Double-Entry Journal Legs</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono bg-surface/60 px-2.5 py-1.5 rounded-xl border border-white/5">
                      <span className="text-rose-400">DEBIT</span>
                      <span className="text-zinc-300">{trx.accountName}</span>
                      <span className="text-zinc-100">₦{trx.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono bg-surface/60 px-2.5 py-1.5 rounded-xl border border-white/5">
                      <span className="text-emerald-400">CREDIT</span>
                      <span className="text-zinc-300">{trx.categoryName || "Income / Control Account"}</span>
                      <span className="text-zinc-100">₦{trx.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}