import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FIELD_LABEL } from "./fields/FormField";
import { MoneyInput } from "./fields/MoneyInput";
import { AccountPickerSheet } from "./pickers/AccountPickerSheet";
import Format from "@/lib/Format";

export interface AccountSplit {
  id: string;
  account_id: string;
  amount: string;
  fee: string;
}

interface AccountSplitRowProps {
  split: AccountSplit;
  accounts: { id: string; name: string; balance: number }[];
  disabled_ids: string[];
  currency_symbol: string;
  can_remove: boolean;
  onChange: (patch: Partial<AccountSplit>) => void;
  onRemove: () => void;
  onDone: () => void;
}

export function AccountSplitRow({
  split,
  accounts,
  disabled_ids,
  currency_symbol,
  onChange,
  onDone,
}: AccountSplitRowProps) {
  const [picking, setPicking] = useState(false);
  const selected = accounts.find((a) => a.id === split.account_id);

  return (
    <div className="space-y-2.5 rounded-xl border border-border bg-surface p-2.5">
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={FIELD_LABEL}>Account</span>

          <div className="flex items-center gap-1.5">
            {selected && (
              <span className="text-2xs tabular-nums text-muted">
                Bal: {Format.money(selected.balance, currency_symbol).full}
              </span>
            )}

            {/*{can_remove && (
              <button
                type="button"
                aria-label="Remove account"
                onClick={onRemove}
                className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-muted transition-colors hover:text-rose"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}*/}

            <button
              type="button"
              aria-label="Done"
              onClick={onDone}
              className="flex h-5 w-5 items-center justify-center rounded-md bg-(--form-accent)/15 text-(--form-accent) transition-colors"
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPicking(true)}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left"
        >
          <span className="truncate text-xs font-medium text-foreground">
            {selected?.name ?? "Select account"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
        </button>

        <AccountPickerSheet
          open={picking}
          onClose={() => setPicking(false)}
          accounts={accounts}
          selected_id={split.account_id}
          disabled_ids={disabled_ids}
          currency_symbol={currency_symbol}
          onSelect={(account_id) => onChange({ account_id })}
        />
      </div>

      <div className="border-t border-border pt-1.5">
        <span className={`mb-1 block ${FIELD_LABEL}`}>Amount</span>
        <MoneyInput
          size="lg"
          value={split.amount}
          onChange={(amount) => onChange({ amount })}
          currency_symbol={currency_symbol}
        />
      </div>

      <div className="border-t border-border pt-1.5">
        <span className={`mb-1 block ${FIELD_LABEL}`}>Fee (Optional)</span>
        <MoneyInput
          size="sm"
          value={split.fee}
          onChange={(fee) => onChange({ fee })}
          currency_symbol={currency_symbol}
        />
      </div>
    </div>
  );
}