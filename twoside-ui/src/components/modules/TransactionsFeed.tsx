"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  HandCoins, 
  Landmark, 
  ArrowRightLeft, 
  CreditCard 
} from "lucide-react";

interface TransactionRow {
  id: string;
  description: string;
  date: string; // e.g. "2026-08-27"
  amount: number;
  type: string;
  accountId: string;
  accountName: string;
  categoryName?: string;
}

const MOCK_TRANSACTIONS: TransactionRow[] = [
  // --- Bank Account (id: "2") ---
  { id: "b1", description: "Client freelance milestone payment", date: "2026-08-27", amount: 120000, type: "income", accountId: "2", accountName: "Bank", categoryName: "Freelance" },
  { id: "b2", description: "Grocery store pickup at Shoprite", date: "2026-08-26", amount: 15400, type: "expense", accountId: "2", accountName: "Bank", categoryName: "Groceries" },
  { id: "b3", description: "Monthly DSTV Subscription", date: "2026-08-24", amount: 14500, type: "expense", accountId: "2", accountName: "Bank", categoryName: "Utilities" },
  { id: "b4", description: "Automated savings transfer", date: "2026-08-22", amount: 50000, type: "transfer", accountId: "2", accountName: "Bank", categoryName: "Savings" },
  { id: "b5", description: "UI Design consultation fee", date: "2026-08-20", amount: 85000, type: "income", accountId: "2", accountName: "Bank", categoryName: "Consulting" },

  // --- Cash Account (id: "1") ---
  { id: "c1", description: "Emergency cash loan given to John", date: "2026-08-25", amount: 25000, type: "loan_given", accountId: "1", accountName: "Cash", categoryName: "Loans" },
  { id: "c2", description: "Transport fare to Lekki phase 1", date: "2026-08-23", amount: 3500, type: "expense", accountId: "1", accountName: "Cash", categoryName: "Transport" },
  { id: "c3", description: "Streetside coffee and pastries", date: "2026-08-21", amount: 2200, type: "expense", accountId: "1", accountName: "Cash", categoryName: "Food" },

  // --- Savings Account (id: "3") ---
  { id: "s1", description: "Incoming transfer from Bank", date: "2026-08-22", amount: 50000, type: "transfer", accountId: "3", accountName: "Savings", categoryName: "Transfer" },
  { id: "s2", description: "Quarterly interest payout", date: "2026-08-15", amount: 4350, type: "income", accountId: "3", accountName: "Savings", categoryName: "Interest" },
];

interface TransactionsFeedProps {
  selectedAccountId: string | null;
}

export default function TransactionsFeed({ selectedAccountId }: TransactionsFeedProps) {
  const [expandedId, setExpandedId] = useState<string | null>("b1");
  const [searchQuery, setSearchQuery] = useState("");

  const isAll = !selectedAccountId || selectedAccountId === "all";

  const filteredTransactions = MOCK_TRANSACTIONS.filter((trx) => {
    const matchesAccount = isAll || trx.accountId === selectedAccountId;
    const matchesSearch = trx.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAccount && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const mStr = date.toLocaleDateString("en-US", { month: "short" });
      return `${mStr} ${day}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income": return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case "expense": return <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />;
      case "transfer": return <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />;
      case "loan_given": return <HandCoins className="w-3.5 h-3.5 text-purple-400" />;
      case "loan_borrowed": return <Landmark className="w-3.5 h-3.5 text-amber-400" />;
      case "loan_repay_received": return <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />;
      case "loan_repay_paid": return <CreditCard className="w-3.5 h-3.5 text-rose-400" />;
      default: return <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "income": return "bg-emerald-500/10 border-emerald-500/20";
      case "expense": return "bg-rose-500/10 border-rose-500/20";
      case "transfer": return "bg-sky-500/10 border-sky-500/20";
      case "loan_given": return "bg-purple-500/10 border-purple-500/20";
      case "loan_borrowed": return "bg-amber-500/10 border-amber-500/20";
      case "loan_repay_received": return "bg-emerald-500/10 border-emerald-500/20";
      case "loan_repay_paid": return "bg-rose-500/10 border-rose-500/20";
      default: return "bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Date Controls Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search recent activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
          />
        </div>

        <button className="p-2 rounded-xl bg-surface/80 border border-white/5 text-muted hover:text-zinc-100 transition-colors flex items-center gap-1.5 text-xs shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Jump</span>
        </button>
      </div>

      {/* Transaction Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Recent Activity</span>
          <span className="text-[10px] font-mono text-muted">{filteredTransactions.length} entries</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAccountId || "all"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-2"
          >
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted bg-surface/40 border border-white/5 rounded-2xl">
                No transactions found for this view.
              </div>
            ) : (
              filteredTransactions.map((trx) => {
                const isExpanded = expandedId === trx.id;
                return (
                  <div
                    key={trx.id}
                    className={`bg-surface/90 border rounded-2xl transition-all ${
                      isExpanded ? "border-primary/40 bg-surface shadow-lg" : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : trx.id)}
                      className="p-3 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Transaction Icon */}
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(trx.type)}`}>
                          {getTransactionIcon(trx.type)}
                        </div>

                        {/* Description & Left Metadata (Date + Account Name if All) */}
                        <div className="min-w-0 space-y-1">
                          <div className="text-xs font-medium text-zinc-100 truncate">{trx.description}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted font-sans">
                            <span className="tracking-normal text-zinc-400 font-medium">{formatDate(trx.date)}</span>
                            {isAll && (
                              <>
                                <span>•</span>
                                <span className="text-muted/90 font-normal">{trx.accountName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Amount + Category underneath for all views */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-mono font-bold ${
                            trx.type === "income" ? "text-emerald-400" : trx.type === "expense" ? "text-zinc-100" : "text-sky-400"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"}₦{trx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </div>
                        
                        {/* Category placed underneath the amount across all views */}
                        <div className="text-[10px] text-muted/80 mt-0.5 font-normal tracking-tight">
                          {trx.categoryName || "General"}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-black/20 rounded-b-2xl space-y-2">
                        <div className="text-[10px] font-mono text-muted uppercase tracking-wider pt-1">Double-Entry Journal Legs</div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono bg-surface/60 px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-rose-400">DEBIT</span>
                            <span className="text-zinc-300">{trx.accountName}</span>
                            <span className="text-zinc-100">₦{trx.amount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono bg-surface/60 px-2.5 py-1.5 rounded-xl border border-white/5">
                            <span className="text-emerald-400">CREDIT</span>
                            <span className="text-zinc-300">{trx.categoryName || "Control Account"}</span>
                            <span className="text-zinc-100">₦{trx.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}