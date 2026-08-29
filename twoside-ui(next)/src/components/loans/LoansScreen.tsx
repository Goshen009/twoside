"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { LoanSummaryCard } from "./LoanSummaryCard";
import { LoanFilters } from "./LoanFilters";
import { CounterpartyModal } from "./CounterpartyModal";
import { LoanCard } from "./LoanCard";

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

const MOCK_LOANS: LoanRow[] = [
  {
    id: "l1",
    counterparty: "John Okoro",
    description: "Emergency cash loan for car repair",
    date: "2026-08-10",
    amount: 50000,
    type: "given",
    status: "partial",
    repaidAmount: 20000,
    repayments: [
      { id: "r1", date: "2026-08-18", amount: 20000, description: "First tranche transfer via bank", accountName: "Bank" },
      { id: "r2", date: "2026-08-18", amount: 20000, description: "First tranche transfer via bank", accountName: "Bank" }
    ]
  },
  {
    id: "l2",
    counterparty: "Sarah Jenkins",
    description: "Startup bridging loan",
    date: "2026-07-15",
    amount: 150000,
    type: "given",
    status: "unpaid",
    repaidAmount: 0,
    repayments: []
  },
  {
    id: "l3",
    counterparty: "Chidi Nnamdi",
    description: "Short term office space advance",
    date: "2026-06-01",
    amount: 80000,
    type: "given",
    status: "paid",
    repaidAmount: 80000,
    repayments: [
      { id: "r2", date: "2026-06-20", amount: 40000, description: "Half repayment", accountName: "Bank" },
      { id: "r3", date: "2026-07-05", amount: 40000, description: "Final settlement cash", accountName: "Cash" }
    ]
  },
  {
    id: "l4",
    counterparty: "Uncle David",
    description: "Family support loan borrowed",
    date: "2026-08-05",
    amount: 100000,
    type: "received",
    status: "partial",
    repaidAmount: 30000,
    repayments: [
      { id: "r4", date: "2026-08-20", amount: 30000, description: "Partial payback sent", accountName: "Bank" }
    ]
  },
  {
    id: "l5",
    counterparty: "Amina Yusuf",
    description: "Quick cash borrowed for ticket",
    date: "2026-08-25",
    amount: 25000,
    type: "received",
    status: "unpaid",
    repaidAmount: 0,
    repayments: []
  }
];

export default function LoansScreen() {
  const [expandedIds, setExpandedIds] = useState<string[]>(["l1"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"given" | "received">("given");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "partial" | "paid">("all");
  const [selectedCounterparty, setSelectedCounterparty] = useState<string>("all");
  const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false);

  const availableCounterparties = Array.from(
    new Set(
      MOCK_LOANS
        .filter((loan) => loan.type === activeTab)
        .map((loan) => loan.counterparty)
    )
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSelectedCounterparty("all");
    setSearchQuery("");
  };

  const filteredLoans = MOCK_LOANS.filter((loan) => {
    const matchesTab = loan.type === activeTab;
    const matchesSearch = loan.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          loan.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    const matchesCounterparty = selectedCounterparty === "all" || loan.counterparty === selectedCounterparty;

    return matchesTab && matchesSearch && matchesStatus && matchesCounterparty;
  });

  const hasActiveFilters = statusFilter !== "all" || selectedCounterparty !== "all" || searchQuery !== "";

  const totalOwedToMe = MOCK_LOANS
    .filter((l) => l.type === "given" && l.status !== "paid")
    .reduce((sum, l) => sum + (l.amount - l.repaidAmount), 0);

  const totalIOwe = MOCK_LOANS
    .filter((l) => l.type === "received" && l.status !== "paid")
    .reduce((sum, l) => sum + (l.amount - l.repaidAmount), 0);

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

  return (
    <div className="min-h-screen relative pb-28">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        <LoanSummaryCard totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />

        {/* Primary Segment Switcher */}
        <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab("given");
              setSelectedCounterparty("all");
            }}
            className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "given"
                ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                : "text-muted hover:text-zinc-200"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Loans Given</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("received");
              setSelectedCounterparty("all");
            }}
            className={`py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "received"
                ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                : "text-muted hover:text-zinc-200"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Loans Received</span>
          </button>
        </div>

        <LoanFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedCounterparty={selectedCounterparty}
          setIsCounterpartyModalOpen={setIsCounterpartyModalOpen}
          hasActiveFilters={hasActiveFilters}
          handleResetFilters={handleResetFilters}
        />

        <CounterpartyModal
          isOpen={isCounterpartyModalOpen}
          onClose={() => setIsCounterpartyModalOpen(false)}
          availableCounterparties={availableCounterparties}
          selectedCounterparty={selectedCounterparty}
          onSelect={setSelectedCounterparty}
        />

        {/* Loan List Feed */}
        <div className="space-y-2 pt-1">
          {/*<div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-sans text-muted uppercase tracking-wider block">
              {activeTab === "given" ? "Loans Given Registry" : "Loans Received Registry"} ({filteredLoans.length})
            </span>
          </div>*/}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${statusFilter}-${selectedCounterparty}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="space-y-2.5"
            >
              {filteredLoans.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted bg-surface/40 border border-white/5 rounded-2xl">
                  No loans found matching your criteria.
                </div>
              ) : (
                filteredLoans.map((loan) => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    isExpanded={expandedIds.includes(loan.id)}
                    onToggleExpand={toggleExpand}
                    formatDate={formatDate}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}