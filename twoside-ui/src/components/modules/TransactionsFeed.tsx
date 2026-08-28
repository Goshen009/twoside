"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Calendar, 
  SlidersHorizontal, 
  X, 
  ChevronRight, 
  Tag, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  HandCoins, 
  Landmark, 
  ArrowRightLeft, 
  CreditCard,
  Check,
  RotateCcw
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
  { id: "b1", description: "Client freelance milestone payment", date: "2026-08-27", amount: 120000, type: "income", accountId: "2", accountName: "Bank", categoryName: "Freelance" },
  { id: "b2", description: "Grocery store pickup at Shoprite", date: "2026-08-26", amount: 15400, type: "expense", accountId: "2", accountName: "Bank", categoryName: "Groceries" },
  { id: "b3", description: "Monthly DSTV Subscription", date: "2026-08-24", amount: 14500, type: "expense", accountId: "2", accountName: "Bank", categoryName: "Utilities" },
  { id: "b4", description: "Automated savings transfer", date: "2026-08-22", amount: 50000, type: "transfer", accountId: "2", accountName: "Bank", categoryName: "Savings" },
  { id: "b5", description: "UI Design consultation fee", date: "2026-08-20", amount: 85000, type: "income", accountId: "2", accountName: "Bank", categoryName: "Consulting" },
  { id: "c1", description: "Emergency cash loan given to John", date: "2026-08-25", amount: 25000, type: "loan_given", accountId: "1", accountName: "Cash", categoryName: "Loans" },
  { id: "c2", description: "Transport fare to Lekki phase 1", date: "2026-08-23", amount: 3500, type: "expense", accountId: "1", accountName: "Cash", categoryName: "Transport" },
  { id: "c3", description: "Streetside coffee and pastries", date: "2026-08-21", amount: 2200, type: "expense", accountId: "1", accountName: "Cash", categoryName: "Food" },
  { id: "s1", description: "Incoming transfer from Bank", date: "2026-08-22", amount: 50000, type: "transfer", accountId: "3", accountName: "Savings", categoryName: "Transfer" },
  { id: "s2", description: "Quarterly interest payout", date: "2026-08-15", amount: 4350, type: "income", accountId: "3", accountName: "Savings", categoryName: "Interest" },
];

interface TransactionsFeedProps {
  selectedAccountId: string | null;
}

export default function TransactionsFeed({ selectedAccountId }: TransactionsFeedProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>(["b1"]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter & Drawer States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<"today" | "week" | "month" | "all" | null>("today");
  
  // Staged filter values (modified inside the drawer)
  const [stagedFromDate, setStagedFromDate] = useState("2026-08-28");
  const [stagedToDate, setStagedToDate] = useState("2026-08-28");
  const [stagedCategory, setStagedCategory] = useState<string>("all");

  // Applied filter values (actively filtering the feed)
  const [appliedFromDate, setAppliedFromDate] = useState("2026-08-28");
  const [appliedToDate, setAppliedToDate] = useState("2026-08-28");
  const [appliedCategory, setAppliedCategory] = useState<string>("all");

  // Bottom Sheet Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const isAll = !selectedAccountId || selectedAccountId === "all";

  // Extract unique categories based on account context
  const availableCategories = Array.from(
    new Set(
      MOCK_TRANSACTIONS
        .filter((trx) => isAll || trx.accountId === selectedAccountId)
        .map((trx) => trx.categoryName || "General")
    )
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Preset Date Calculators (Current date reference: 2026-08-28)
  const handlePresetSelect = (preset: "today" | "week" | "month" | "all") => {
    setActivePreset(preset);
    switch (preset) {
      case "today":
        setStagedFromDate("2026-08-28");
        setStagedToDate("2026-08-28");
        break;
      case "week":
        setStagedFromDate("2026-08-24");
        setStagedToDate("2026-08-28");
        break;
      case "month":
        setStagedFromDate("2026-08-01");
        setStagedToDate("2026-08-31");
        break;
      case "all":
        setStagedFromDate("");
        setStagedToDate("");
        break;
    }
  };

  const handleFromDateChange = (val: string) => {
    setActivePreset(null);
    setStagedFromDate(val);
  };

  const handleToDateChange = (val: string) => {
    setActivePreset(null);
    setStagedToDate(val);
  };

  const handleApplyFilters = () => {
    setAppliedFromDate(stagedFromDate);
    setAppliedToDate(stagedToDate);
    setAppliedCategory(stagedCategory);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    setActivePreset("today");
    setStagedFromDate("2026-08-28");
    setStagedToDate("2026-08-28");
    setStagedCategory("all");
    setAppliedFromDate("2026-08-28");
    setAppliedToDate("2026-08-28");
    setAppliedCategory("all");
  };

  // Filter calculations based on ACTIVE APPLIED filters
  const filteredTransactions = MOCK_TRANSACTIONS.filter((trx) => {
    const matchesAccount = isAll || trx.accountId === selectedAccountId;
    const matchesSearch = trx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = appliedCategory === "all" || (trx.categoryName || "General") === appliedCategory;
    
    let matchesPeriod = true;
    if (appliedFromDate && trx.date < appliedFromDate) matchesPeriod = false;
    if (appliedToDate && trx.date > appliedToDate) matchesPeriod = false;

    return matchesAccount && matchesSearch && matchesCategory && matchesPeriod;
  });

  const hasActiveFilters = appliedCategory !== "all" || appliedFromDate !== "2026-08-28" || appliedToDate !== "2026-08-28";

  // Compute accounting metrics for the period summary strip
  const totalInflow = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const openingBalance = 450000;
  const closingBalance = openingBalance + totalInflow - totalOutflow;

  // Single standard formatDate function (e.g., "Aug 27, 2026")
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
    <div className="space-y-3 relative">
      {/* Search & Collapsible Filter Toggle Bar */}
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

        {/* Master Filter / Drawer Toggle Button */}
        <button
          onClick={() => {
            setStagedFromDate(appliedFromDate);
            setStagedToDate(appliedToDate);
            setStagedCategory(appliedCategory);
            setIsFilterOpen(!isFilterOpen);
          }}
          className={`relative p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs shrink-0 ${
            isFilterOpen || hasActiveFilters
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
              : "bg-surface/80 border-white/5 text-muted hover:text-zinc-100"
          }`}
          title="Toggle Filters & Summary"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
          )}
        </button>
      </div>

      {/* Expandable Filter & Accounting Summary Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-surface/90 border border-white/10 rounded-2xl p-3.5 space-y-3 backdrop-blur-md">
              
              {/* Quick Date Range Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0 mr-0.5">Presets:</span>
                <button
                  onClick={() => handlePresetSelect("today")}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all shrink-0 ${
                    activePreset === "today"
                      ? "bg-primary/20 border-primary/40 text-primary font-medium"
                      : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100 hover:border-white/10"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handlePresetSelect("week")}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all shrink-0 ${
                    activePreset === "week"
                      ? "bg-primary/20 border-primary/40 text-primary font-medium"
                      : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100 hover:border-white/10"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => handlePresetSelect("month")}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all shrink-0 ${
                    activePreset === "month"
                      ? "bg-primary/20 border-primary/40 text-primary font-medium"
                      : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100 hover:border-white/10"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => handlePresetSelect("all")}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all shrink-0 ${
                    activePreset === "all"
                      ? "bg-primary/20 border-primary/40 text-primary font-medium"
                      : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100 hover:border-white/10"
                  }`}
                >
                  All Time
                </button>
              </div>

              {/* Custom Date Range Pickers */}
              <div className="grid grid-cols-2 gap-2">
                {/* START Date Picker */}
                <div 
                  onClick={() => {
                    if (fromDateRef.current) {
                      if (typeof fromDateRef.current.showPicker === "function") {
                        fromDateRef.current.showPicker();
                      } else {
                        fromDateRef.current.click();
                      }
                    }
                  }}
                  className="flex flex-col bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 hover:border-primary/40 transition-all cursor-pointer text-left"
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted text-left">START</span>
                  <div className="flex items-center justify-between text-xs text-zinc-200 mt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Calendar className="w-3 h-3 text-primary shrink-0" />
                      <span className="font-sans text-[11px] font-medium truncate">
                        {stagedFromDate ? formatDate(stagedFromDate) : "No Date"}
                      </span>
                    </div>
                    <input
                      ref={fromDateRef}
                      type="date"
                      value={stagedFromDate}
                      onChange={(e) => handleFromDateChange(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* END Date Picker */}
                <div 
                  onClick={() => {
                    if (toDateRef.current) {
                      if (typeof toDateRef.current.showPicker === "function") {
                        toDateRef.current.showPicker();
                      } else {
                        toDateRef.current.click();
                      }
                    }
                  }}
                  className="flex flex-col bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 hover:border-primary/40 transition-all cursor-pointer text-right"
                >
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted text-right">END</span>
                  <div className="flex items-center justify-end text-xs text-zinc-200 mt-0.5">
                    <input
                      ref={toDateRef}
                      type="date"
                      value={stagedToDate}
                      onChange={(e) => handleToDateChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-sans text-[11px] font-medium truncate">
                        {stagedToDate ? formatDate(stagedToDate) : "No Date"}
                      </span>
                      <Calendar className="w-3 h-3 text-primary shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Selector Input Field */}
              <div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{stagedCategory === "all" ? "All Categories" : stagedCategory}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                </button>
              </div>

              {/* Drawer Actions: Apply & Reset */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-zinc-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-background transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet Category Modal Popup */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div 
            onClick={() => setIsCategoryModalOpen(false)}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm p-3 cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[70vh] flex flex-col cursor-default"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-100">Select Category</span>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setStagedCategory("all");
                    setIsCategoryModalOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    stagedCategory === "all"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
                  }`}
                >
                  <span>All Categories</span>
                  {stagedCategory === "all" && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>

                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setStagedCategory(cat);
                      setIsCategoryModalOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      stagedCategory === cat
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
                    }`}
                  >
                    <span>{cat}</span>
                    {stagedCategory === cat && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unified Statement Header & Summary Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-sans text-muted uppercase tracking-wider block">
            {appliedFromDate || appliedToDate 
              ? `Summary from ${appliedFromDate ? formatDate(appliedFromDate) : "No Date"} to ${appliedToDate ? formatDate(appliedToDate) : "No Date"}`
              : "All-Time Financial Summary"}
            {appliedCategory !== "all" && ` • ${appliedCategory}`}
          </span>
        </div>

        {/* Accounting Statement Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Opening Balance</span>
            <span className="text-xs font-mono font-bold text-zinc-200">₦{openingBalance.toLocaleString()}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Money In</span>
            <span className="text-xs font-mono font-bold text-emerald-400">+₦{totalInflow.toLocaleString()}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Money Out</span>
            <span className="text-xs font-mono font-bold text-rose-400">-₦{totalOutflow.toLocaleString()}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Closing Balance</span>
            <span className="text-xs font-mono font-bold text-sky-400">₦{closingBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Transaction Stream Header */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-sans text-muted uppercase tracking-wider block">
            Transaction Activity
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedAccountId || "all"}-${appliedCategory}-${appliedFromDate}-${appliedToDate}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.01, ease: "easeOut" }}
            className="space-y-2"
          >
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted bg-surface/40 border border-white/5 rounded-2xl">
                No transactions found matching these filters.
              </div>
            ) : (
              filteredTransactions.map((trx) => {
                const isExpanded = expandedIds.includes(trx.id);
                return (
                  <div
                    key={trx.id}
                    className={`bg-surface/90 border rounded-2xl transition-all ${
                      isExpanded ? "border-primary/40 bg-surface shadow-lg" : "border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div
                      onClick={() => toggleExpand(trx.id)}
                      className="p-3 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(trx.type)}`}>
                          {getTransactionIcon(trx.type)}
                        </div>

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

                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-mono font-bold ${
                            trx.type === "income" ? "text-emerald-400" : trx.type === "expense" ? "text-zinc-100" : "text-sky-400"
                          }`}
                        >
                          {trx.type === "income" ? "+" : "-"}₦{trx.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                        </div>
                        
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