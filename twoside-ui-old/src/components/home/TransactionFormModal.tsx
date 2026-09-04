import { X } from "lucide-react";
import { type TransactionType, TRANSACTION_TYPE_META } from "../../libs/transaction-style";
import ExpenseForm from "../transactions/forms/ExpenseForm";
import IncomeForm from "../transactions/forms/IncomeForm";
import TransferForm from "../transactions/forms/TransferForm";
import GiveLoanForm from "../transactions/forms/GiveLoanForm";
import BorrowForm from "../transactions/forms/BorrowForm";
import ReceiveRepaymentForm from "../transactions/forms/ReceiveRepaymentForm";
import RepayLoanForm from "../transactions/forms/RepayLoanForm";

type TransactionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialType: TransactionType;
};

export default function TransactionFormModal({ isOpen, onClose, initialType }: TransactionFormModalProps) {
  if (!isOpen) return null;

  const meta = TRANSACTION_TYPE_META[initialType];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface border-t border-x border-white/10 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
              <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
            </div>
            <h3 className="text-sm font-bold text-zinc-100">{meta.label}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {initialType === "expense" && <ExpenseForm on_success={onClose} />}
        {initialType === "income" && <IncomeForm on_success={onClose} />}
        {initialType === "transfer" && <TransferForm on_success={onClose} />}
        {initialType === "loan_given" && <GiveLoanForm on_success={onClose} />}
        {initialType === "loan_borrowed" && <BorrowForm on_success={onClose} />}
        {initialType === "loan_repay_received" && <ReceiveRepaymentForm on_success={onClose} />}
        {initialType === "loan_repay_paid" && <RepayLoanForm on_success={onClose} />}
      </div>
    </div>
  );
}