import { Plus } from "lucide-react";
import { FormField } from "./FormField";
import { useUserStore } from "@/stores/useUserStore";
import { AccountSplitRow, type AccountSplit } from "./AccountSplitRow";

interface AccountSplitSectionProps {
  label: string;
  splits: AccountSplit[];
  onChange: (splits: AccountSplit[]) => void;
  currency_symbol: string;
}

export function AccountSplitSection({ label, splits, onChange, currency_symbol }: AccountSplitSectionProps) {
  const accounts = useUserStore((s) => s.data?.accounts) ?? [];
  const used = new Set(splits.map((s) => s.account_id));
  const can_add = splits.length < accounts.length;

  const update = (id: string, patch: Partial<AccountSplit>) =>
    onChange(splits.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const remove = (id: string) => onChange(splits.filter((s) => s.id !== id));

  const add = () => {
    const next = accounts.find((a) => !used.has(a.id));
    if (!next) return;
    onChange([...splits, { id: crypto.randomUUID(), account_id: next.id, amount: "", fee: "" }]);
  };

  return (
    <FormField label={label}>
      <div className="space-y-2">
        {splits.map((split) => (
          <AccountSplitRow
            key={split.id}
            split={split}
            options={accounts.filter((a) => a.id === split.account_id || !used.has(a.id))}
            currency_symbol={currency_symbol}
            can_remove={splits.length > 1}
            onChange={(patch) => update(split.id, patch)}
            onRemove={() => remove(split.id)}
          />
        ))}
        {can_add && (
          <button
            type="button"
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Split With Another Account
          </button>
        )}
      </div>
    </FormField>
  );
}