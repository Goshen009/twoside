"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, User, ChevronRight, RotateCcw } from "lucide-react";

interface LoanFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  statusFilter: "all" | "unpaid" | "partial" | "paid";
  setStatusFilter: (status: "all" | "unpaid" | "partial" | "paid") => void;
  selectedCounterparty: string;
  setIsCounterpartyModalOpen: (open: boolean) => void;
  hasActiveFilters: boolean;
  handleResetFilters: () => void;
}

export function LoanFilters({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
  statusFilter,
  setStatusFilter,
  selectedCounterparty,
  setIsCounterpartyModalOpen,
  hasActiveFilters,
  handleResetFilters,
}: LoanFiltersProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search description or counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
          />
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`relative p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs shrink-0 ${
            isFilterOpen || hasActiveFilters
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
              : "bg-surface/80 border-white/5 text-muted hover:text-zinc-100"
          }`}
          title="Toggle Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
          )}
        </button>
      </div>

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
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Repayment Status</span>
                <div className="grid grid-cols-4 gap-1">
                  {(["all", "unpaid", "partial", "paid"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`py-1.5 rounded-xl border text-[11px] capitalize transition-all ${
                        statusFilter === status
                          ? "bg-primary/20 border-primary/40 text-primary font-medium"
                          : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Counterparty</span>
                <button
                  onClick={() => setIsCounterpartyModalOpen(true)}
                  className="w-full flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">{selectedCounterparty === "all" ? "All Counterparties" : selectedCounterparty}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                </button>
              </div>

              <div className="flex items-center pt-1 border-t border-white/5">
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-zinc-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}