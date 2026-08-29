import { X } from "lucide-react";
import type { Account, TransactionType } from "@/lib/types";

type TransactionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  initialType: TransactionType;
};

export default function TransactionFormModal({
  isOpen,
  onClose,
  accounts,
  initialType,
}: TransactionFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-3">
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100 capitalize">
            {initialType.replace(/_/g, " ")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-muted">
          Form for "{initialType}" goes here — {accounts.length} accounts available.
        </p>
      </div>
    </div>
  );
}