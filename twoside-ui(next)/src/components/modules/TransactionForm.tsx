"use client";

import { X, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, HandCoins, Landmark, ArrowRightLeft, CreditCard } from "lucide-react";
import { AccountBalance, TransactionType } from "@/lib/types";
import ExpenseForm from "@/components/modules/forms/ExpenseForm";
import IncomeForm from "@/components/modules/forms/IncomeForm";
import TransferForm from "@/components/modules/forms/TransferForm";
import LoanGivenForm from "@/components/modules/forms/LoanGivenForm";
import LoanBorrowedForm from "@/components/modules/forms/LoanBorrowedForm";
import RepayInForm from "@/components/modules/forms/RepayInForm";
import RepayOutForm from "@/components/modules/forms/RepayOutForm";

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountBalance[];
  initialType: TransactionType;
}

export default function TransactionFormModal({
  isOpen,
  onClose,
  accounts,
  initialType,
}: TransactionFormModalProps) {
  const getTitle = (type: TransactionType) => {
    switch (type) {
      case "expense": return "Expense";
      case "income": return "Income";
      case "transfer": return "Transfer";
      case "loan_given": return "Loan Given";
      case "loan_borrowed": return "Borrowing";
      case "loan_repay_received": return "Repay In";
      case "loan_repay_paid": return "Repay Out";
      default: return "Transaction";
    }
  };

  const getIcon = (type: TransactionType) => {
    switch (type) {
      case "expense": return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "income": return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case "transfer": return <ArrowLeftRight className="w-4 h-4 text-sky-400" />;
      case "loan_given": return <HandCoins className="w-4 h-4 text-purple-400" />;
      case "loan_borrowed": return <Landmark className="w-4 h-4 text-amber-400" />;
      case "loan_repay_received": return <ArrowRightLeft className="w-4 h-4 text-emerald-400" />;
      case "loan_repay_paid": return <CreditCard className="w-4 h-4 text-rose-400" />;
    }
  };

  const getIconBg = (type: TransactionType) => {
    switch (type) {
      case "expense": return "bg-red-500/10 border-red-500/20";
      case "income": return "bg-emerald-500/10 border-emerald-500/20";
      case "transfer": return "bg-sky-500/10 border-sky-500/20";
      case "loan_given": return "bg-purple-500/10 border-purple-500/20";
      case "loan_borrowed": return "bg-amber-500/10 border-amber-500/20";
      case "loan_repay_received": return "bg-emerald-500/10 border-emerald-500/20";
      case "loan_repay_paid": return "bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container with slide-up / scale animation */}
      <div
        className={`relative w-full sm:max-w-md bg-surface border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${
          isOpen ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-12 opacity-0 sm:scale-95"
        }`}
      >
        {/* Universal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${getIconBg(initialType)}`}>
              {getIcon(initialType)}
            </div>
            <h2 className="text-base font-bold text-zinc-100">{getTitle(initialType)}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Switcher */}
                {initialType === "expense" ? (
                  <ExpenseForm accounts={accounts} onClose={onClose} />
                ) : initialType === "income" ? (
                  <IncomeForm accounts={accounts} onClose={onClose} />
                ) : initialType === "transfer" ? (
                  <TransferForm accounts={accounts} onClose={onClose} />
                ) : initialType === "loan_given" ? (
                  <LoanGivenForm accounts={accounts} onClose={onClose} />
                ) : initialType === "loan_borrowed" ? (
                  <LoanBorrowedForm accounts={accounts} onClose={onClose} />
                ) : initialType === "loan_repay_received" ? (
                  <RepayInForm accounts={accounts} onClose={onClose} />
                ) : initialType === "loan_repay_paid" ? (
                  <RepayOutForm accounts={accounts} onClose={onClose} />
                ) : (
                  <div className="text-center py-8 text-xs text-muted">
                    Form for {getTitle(initialType)} is being configured next...
                  </div>
                )}
      </div>
    </div>
  );
}