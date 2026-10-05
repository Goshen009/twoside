import { Trash2 } from "lucide-react";
import type { AccountSplit } from "./AccountSplitRow";

import Format from "@/lib/Format";

interface AccountSplitSummaryProps {
  split: AccountSplit;
  account: { name: string; balance: number } | undefined;
  currency_symbol: string;
  can_remove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export function AccountSplitSummary({ split, account, currency_symbol, can_remove, onEdit, onRemove }: AccountSplitSummaryProps) {
  const amount = parseFloat(split.amount) || 0;
  const fee = parseFloat(split.fee) || 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <span className="block truncate text-xs font-semibold text-foreground">{account?.name ?? "Select account"}</span>
          {account && (
            <span className="mt-0.5 block text-2xs tabular-nums text-muted">
              Bal: {Format.money(account.balance, currency_symbol).full}
            </span>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className={`block text-[13px] font-bold tabular-nums ${amount > 0 ? "text-foreground" : "text-muted"}`}>
            {amount > 0 ? Format.money(amount, currency_symbol).full : "Enter amount"}
          </span>
          <span className="text-2xs tabular-nums text-muted">Fee: {Format.money(fee, currency_symbol).full}</span>
        </div>
      </button>

      {can_remove && (
        <button
          type="button"
          aria-label="Remove account"
          onClick={onRemove}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-muted transition-colors hover:text-rose"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}