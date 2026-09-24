import type { TransactionEntry } from "@/stores/useTransactionsStore";
import { TransactionRow } from "./TransactionRow";

interface TransactionGroupProps {
  label: string;
  entries: TransactionEntry[];
  currency_symbol: string;
}

export function TransactionGroup({ label, entries, currency_symbol }: TransactionGroupProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <h2 className="text-2xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </h2>
      </div>
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <TransactionRow
            key={entry.entry_id}
            entry={entry}
            currency_symbol={currency_symbol}
          />
        ))}
      </div>
    </div>
  );
}
