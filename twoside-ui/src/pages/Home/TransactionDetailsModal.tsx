import type { TransactionEntry } from "@/stores/useTransactionsStore";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import Constants from "@/lib/Constants";
import Format from "@/lib/Format";

interface DetailRow {
  label: string;
  value: string;
}

interface TransactionDetailsModalProps {
  entry: TransactionEntry | null;
  currency_symbol: string;
  timezone: string;
  onClose: () => void;
}

function buildExtraRows(entry: TransactionEntry): DetailRow[] {
  switch (entry.log_type) {
    case "EXPENSE":
      return [{ label: "Category", value: entry.category_name ?? "None" }];

    case "TRANSFER":
      return [
        {
          label: entry.side === "CREDIT" ? "To Account" : "From Account",
          value: entry.related_account?.name ?? "—",
        },
      ];

    case "GIVE_LOAN":
      return [{ label: "Lent To", value: entry.related_counterparty?.name ?? "—" }];

    case "BORROW":
      return [{ label: "Borrowed From", value: entry.related_counterparty?.name ?? "—" }];

    case "REPAY_LOAN":
      return [
        { label: "Paid To", value: entry.related_counterparty?.name ?? "—" },
        // TODO: backend doesn't currently return loan total / remaining balance
        // on this entry — add e.g. `loan_total_amount` and `loan_remaining_amount`
        // to the /transactions response + TransactionEntry type, then replace
        // this row with real values.
        { label: "Remaining Balance", value: "Not available yet" },
      ];

    case "RECEIVE_REPAYMENT":
      return [
        { label: "Repaid By", value: entry.related_counterparty?.name ?? "—" },
        // TODO: same gap as above.
        { label: "Remaining Balance", value: "Not available yet" },
      ];

    case "INCOME":
    default:
      return [];
  }
}

export function TransactionDetailsModal({ entry, currency_symbol, timezone, onClose }: TransactionDetailsModalProps) {
  if (!entry) return null;

  const meta = Constants.TRANSACTION_TYPE_META[entry.log_type];
  const Icon = meta.icon;
  const is_inflow = entry.side === "DEBIT";

  const base_rows: DetailRow[] = [
    { label: "Description", value: entry.description },
    ...buildExtraRows(entry),
    { label: "Date & Time", value: Format.time(entry.transaction_date, timezone).full },
    { label: "Account", value: entry.account_name },
    {
      label: "Transaction Fee",
      value: Format.money(entry.charge_amount ?? 0, currency_symbol).full,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-50 bg-surface border-t border-border rounded-t-[32px] shadow-2xl px-5 pt-3 pb-8 flex flex-col gap-4 max-w-md mx-auto"
      >
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-1" />

        <div className="flex items-center justify-end px-1">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-2 text-center">
          <div className={`w-12 h-12 rounded-full ${meta.bg} border border-white/10 flex items-center justify-center ${meta.text} mb-2`}>
            <Icon className="w-5 h-5" />
          </div>
          <span
            className={`text-3xl font-extrabold tracking-tight tabular-nums mb-1 ${
              is_inflow ? "text-income" : "text-expense"
            }`}
          >
            {is_inflow ? "+" : "-"}
            {Format.money(entry.amount, currency_symbol).full}
          </span>
          <span className="text-xs text-muted font-medium tracking-wide uppercase">
            {meta.label}
          </span>
        </div>

        <div className="bg-background rounded-2xl p-4 border border-border space-y-2.5">
          {base_rows.map((row, i) => (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{row.label}</span>
                <span className="font-medium text-foreground text-right tabular-nums">
                  {row.value}
                </span>
              </div>
              {i < base_rows.length - 1 && <div className="border-t border-border mt-2.5" />}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}