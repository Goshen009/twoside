import React, { useState } from "react";
import { History } from "lucide-react";
import { DUMMY_LOANS, type LoanItem } from "../data/loansDummyData";
import { LoansFeed } from "../components/loans/LoansFeed";
import { LoansBalances } from "../components/loans/LoansBalances";
import { LoanDetailModal } from "../components/loans/LoanDetailModal";
import Navbar from "@/components/shared/Navbar";
import TransactionTypeSheet from "@/components/transactions/TransactionTypeSheet";
import TransactionFormModal from "@/components/home/TransactionFormModal";
import type { TransactionType } from "@/libs/transaction-style";

export default function LoansPage() {
  const [loans] = useState<LoanItem[]>(DUMMY_LOANS);
  const [direction_tab, set_direction_tab] = useState<"LENT" | "BORROWED">("LENT");
  const [view_mode, set_view_mode] = useState<"active" | "past">("active");
  const [selected_loan, set_selected_loan] = useState<LoanItem | null>(null);

  // Navbar and action modal states
  const [is_action_sheet_open, set_is_action_sheet_open] = useState(false);
  const [active_modal_type, set_active_modal_type] = useState<TransactionType | null>(null);

  // Calculate totals and counts for active open loans
  const open_lent_loans = loans.filter(l => l.direction === "LENT" && l.status === "OPEN");
  const open_borrowed_loans = loans.filter(l => l.direction === "BORROWED" && l.status === "OPEN");

  const total_lent = open_lent_loans.reduce((acc, l) => acc + (l.amount - l.total_repaid), 0);
  const total_borrowed = open_borrowed_loans.reduce((acc, l) => acc + (l.amount - l.total_repaid), 0);

  // Filter loans based on active direction and view mode
  const filtered_loans = loans.filter((loan) => {
    const matches_direction = loan.direction === direction_tab;
    const matches_status = view_mode === "active" ? loan.status === "OPEN" : loan.status === "CLOSED";
    return matches_direction && matches_status;
  });

  return (
    <div className="min-h-screen relative pb-28">
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {/* Redesigned Swipeable Balances Carousel */}
        <LoansBalances 
          total_lent={total_lent}
          total_borrowed={total_borrowed}
          count_lent={open_lent_loans.length}
          count_borrowed={open_borrowed_loans.length}
          active_direction={direction_tab}
          onSelectDirection={(dir) => set_direction_tab(dir)}
        />

        {/* Sub-bar: Active (Default) vs Past/Closed Loans Switch + Record Count */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center bg-black/20 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => set_view_mode("active")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                view_mode === "active"
                  ? "bg-white/10 text-zinc-100 shadow-sm"
                  : "text-muted hover:text-zinc-300 font-medium"
              }`}
            >
              Active Open
            </button>
            <button
              onClick={() => set_view_mode("past")}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                view_mode === "past"
                  ? "bg-white/10 text-zinc-100 shadow-sm"
                  : "text-muted hover:text-zinc-300 font-medium"
              }`}
            >
              <History className="w-3 h-3" />
              <span>Past History</span>
            </button>
          </div>

          <div className="text-[10px] font-mono text-muted/80 px-1 font-medium">
            {filtered_loans.length} record{filtered_loans.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Loans Feed Component */}
        <LoansFeed 
          loans={filtered_loans} 
          onSelectLoan={(loan) => set_selected_loan(loan)} 
        />

        {/* Loan Details Modal */}
        {selected_loan && (
          <LoanDetailModal 
            loan={selected_loan} 
            onClose={() => set_selected_loan(null)} 
          />
        )}
      </div>

      {/* Shared Bottom Navbar */}
      <Navbar
        active_tab="loans"
        on_open_action_sheet={() => set_is_action_sheet_open(true)}
      />

      {/* Transaction Type Sheet */}
      <TransactionTypeSheet
        is_open={is_action_sheet_open}
        on_close={() => set_is_action_sheet_open(false)}
        on_select_type={(type) => {
          set_is_action_sheet_open(false);
          set_active_modal_type(type);
        }}
      />

      {/* Transaction Form Modal */}
      {active_modal_type && (
        <TransactionFormModal
          isOpen={!!active_modal_type}
          onClose={() => set_active_modal_type(null)}
          initialType={active_modal_type}
        />
      )}
    </div>
  );
}