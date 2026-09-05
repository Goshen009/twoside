import { ChevronRight } from "lucide-react";
import {
  CORE_TRANSACTION_TYPES,
  LOAN_TRANSACTION_TYPES,
  TRANSACTION_TYPE_META,
} from "@/constants/transactions";
import type { TransactionType, TypeSelectorSheetProps } from "@/types/types";

function render_type_row(transaction_type: TransactionType, on_select: (t: TransactionType) => void) {
  const meta = TRANSACTION_TYPE_META[transaction_type];
  const Icon = meta.icon;
  return (
    <button
      key={transaction_type}
      type="button"
      onClick={() => on_select(transaction_type)}
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-background/40 px-3 py-3 text-left transition-colors hover:bg-surface-hover"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${meta.accent}1f`, color: meta.accent }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-foreground">{meta.label}</span>
        <span className="block truncate text-[11px] text-muted">{meta.description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}

export function TypeSelectorSheet({ on_select_type }: TypeSelectorSheetProps) {
  return (
    <div>
      <div className="space-y-1">{CORE_TRANSACTION_TYPES.map((t) => render_type_row(t, on_select_type))}</div>
      <div className="mt-5 space-y-1">
        <p className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Loans
        </p>
        {LOAN_TRANSACTION_TYPES.map((t) => render_type_row(t, on_select_type))}
      </div>
    </div>
  );
}
