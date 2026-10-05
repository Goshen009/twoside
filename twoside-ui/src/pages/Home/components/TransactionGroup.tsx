import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Day } from "@/types/types";
import { useUIStore } from "@/stores/useUIStore";
import { TransactionRow } from "./TransactionRow";

import { Money } from "@/lib/money";

interface TransactionGroupProps {
  day: Day;
  label: string;
  open: boolean;
  onToggle: () => void;
  currency_symbol: string;
  timezone: string;
}

export function TransactionGroup({ day, label, open, onToggle, currency_symbol, timezone }: TransactionGroupProps) {
  const is_hidden = useUIStore((s) => s.is_amounts_hidden);

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-1 mb-2 cursor-pointer"
      >
        <h2 className="text-2xs font-semibold uppercase tracking-wider text-muted">{label}</h2>
        <span className="flex items-center gap-1.5">
          <span className="text-2xs font-semibold tabular-nums text-muted">
            {is_hidden ? "••••" : Money.formatAmount(day.total, currency_symbol)}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {day.transactions.map((t) => (
                <TransactionRow
                  key={t.id}
                  transaction={t}
                  currency_symbol={currency_symbol}
                  timezone={timezone}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}