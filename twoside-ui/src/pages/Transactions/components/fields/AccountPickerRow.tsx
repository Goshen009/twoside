import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AccountPickerSheet } from "../pickers/AccountPickerSheet";
import Format from "@/lib/Format";

interface AccountPickerRowProps {
  tag: string; // "From" | "To"
  value: string;
  accounts: { id: string; name: string; balance: number }[];
  disabled_id?: string; // the account the OTHER row has
  currency_symbol: string;
  onChange: (id: string) => void;
}

export function AccountPickerRow({ tag, value, accounts, disabled_id, currency_symbol, onChange }: AccountPickerRowProps) {
  const [open, setOpen] = useState(false);
  const selected = accounts.find((a) => a.id === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-3 text-left transition-colors active:border-(--form-accent)"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-muted">
              {tag}
            </span>
            <span className="truncate text-xs font-semibold text-foreground">
              {selected?.name ?? "Select account"}
            </span>
          </div>
          {selected && (
            <span className="mt-1 block text-2xs tabular-nums text-muted">
              Bal: {Format.money(selected.balance, currency_symbol).full}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-muted">
          <span className="text-xs font-medium">Change</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      <AccountPickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title={`${tag} Account`}
        accounts={accounts}
        selected_id={value}
        disabled_ids={disabled_id ? [disabled_id] : []}
        currency_symbol={currency_symbol}
        onSelect={onChange}
      />
    </>
  );
}