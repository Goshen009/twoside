"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet } from "lucide-react";
import { AccountBalance } from "@/lib/types";

interface AccountPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountBalance[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  title?: string;
}

export default function AccountPickerSheet({
  isOpen,
  onClose,
  accounts,
  selectedAccountId,
  onSelect,
  title = "Select Account",
}: AccountPickerSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 500 }}
            className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-3xl p-6 shadow-2xl z-10 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                {title}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-background text-muted hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto py-1">
              {accounts.map((acc) => {
                const isSelected = acc.account_id === selectedAccountId;
                return (
                  <div
                    key={acc.account_id}
                    onClick={() => {
                      onSelect(acc.account_id);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${
                      isSelected
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "bg-background border-border hover:border-zinc-700 text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Wallet className="w-4 h-4 opacity-80" />
                      <span className="text-xs font-medium">{acc.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-semibold tracking-wide bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}