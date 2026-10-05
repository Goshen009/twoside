import type { Transaction } from "@/types/types";
import { useUIStore } from "@/stores/useUIStore";

// import { Constants } from "@/lib/Constants";
import { Money } from "@/lib/money";
import { Dates } from "@/lib/dates";

interface TransactionRowProps {
  transaction: Transaction;
  currency_symbol: string;
  timezone: string;
}

export function TransactionRow({ transaction, currency_symbol, timezone }: TransactionRowProps) {
  const is_hidden = useUIStore((s) => s.is_amounts_hidden);

  // const meta = Constants.TRANSACTION_TYPE_META.EXPENSE;
  // const Icon = meta.icon;

  return (
    <div className="py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {/*<div className={`w-11 h-11 rounded-2xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>*/}
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-foreground leading-tight line-clamp-2">
            {transaction.description}
          </p>
          <p className="text-2xs text-muted leading-normal mt-1">
            {Dates.formatTime(transaction.transaction_date, timezone)} • {transaction.tag ?? "Untagged"}
          </p>
        </div>
      </div>
      <span
        className={`text-[13px] font-semibold tabular-nums shrink-0 ${
          is_hidden ? "text-white" : "text-expense"
        }`}
      >
        {is_hidden ? (
          <span className="text-muted">—</span>
        ) : (
          <>-{Money.formatAmount(transaction.amount, currency_symbol)}</>
        )}
      </span>
    </div>
  );
}

export function TransactionSkeletonList() {
  return (
    <div className="space-y-1">
      <div className="h-3 w-16 rounded bg-surface-hover animate-pulse mb-2 px-1" />
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3 w-32 rounded bg-surface-hover animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-surface-hover animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-16 rounded bg-surface-hover animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}