import { Check, ChevronDown, Trash2 } from "lucide-react";
import { FIELD_LABEL } from "./fields/FormField";
import { MoneyInput } from "./fields/MoneyInput";

import Format from "@/lib/Format";

export interface AccountSplit {
  id: string;
  account_id: string;
  amount: string;
  fee: string;
}

interface AccountSplitRowProps {
  split: AccountSplit;
  options: { id: string; name: string; balance: number }[];
  currency_symbol: string;
  can_remove: boolean;
  onChange: (patch: Partial<AccountSplit>) => void;
  onRemove: () => void;
  onDone: () => void;
}

export function AccountSplitRow({split, options, currency_symbol, can_remove, onChange, onRemove, onDone}: AccountSplitRowProps) {
  const selected = options.find((o) => o.id === split.account_id);

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
          
            {can_remove && (
              <button type="button" aria-label="Remove account" onClick={onRemove}
                className="flex h-5 w-5 items-center justify-center rounded-md bg-white/5 text-muted transition-colors hover:text-rose">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          
            <button type="button" aria-label="Done" onClick={onDone}
              className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-primary transition-colors">
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="relative flex h-10 items-center rounded-lg border border-border bg-background px-3">
          <select
            value={split.account_id}
            onChange={(e) => onChange({ account_id: e.target.value })}
            className="w-full appearance-none bg-transparent pr-6 text-xs font-medium text-foreground outline-none"
          >
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-muted" />
        </div>
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