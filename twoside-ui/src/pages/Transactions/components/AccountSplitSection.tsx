import { useState } from "react";
import { Plus } from "lucide-react";
import { FormField } from "./fields/FormField";
import { useUserStore } from "@/stores/useUserStore";
import { AccountSplitRow, type AccountSplit } from "./AccountSplitRow";
import { AccountSplitSummary } from "./AccountSplitSummary";

interface AccountSplitSectionProps {
  label: string;
  splits: AccountSplit[];
  onChange: (splits: AccountSplit[]) => void;
  currency_symbol: string;
}

export function AccountSplitSection({ label, splits, onChange, currency_symbol }: AccountSplitSectionProps) {
  const accounts = useUserStore((s) => s.data?.accounts) ?? [];
  const [editing_id, setEditingId] = useState<string | null>(() => splits[0]?.id ?? null);

  const used = new Set(splits.map((s) => s.account_id));
  const can_add = splits.length < accounts.length;

  const update = (id: string, patch: Partial<AccountSplit>) => {
    onChange(splits.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const remove = (id: string) => {
    onChange(splits.filter((s) => s.id !== id));
    if (editing_id === id) setEditingId(null);
  };

  const add = () => {
    const next = accounts.find((a) => !used.has(a.id));
    if (!next) return;
    const id = Math.random().toString(36).slice(2);
    onChange([...splits, { id, account_id: next.id, amount: "", fee: "" }]);
    setEditingId(id);
  };

  return (
    <FormField label={label}>
      <div className="space-y-2">
        {splits.map((split) =>
          split.id === editing_id ? (
            <AccountSplitRow
              key={split.id}
              split={split}
              accounts={accounts}
              disabled_ids={splits.filter((s) => s.id !== split.id).map((s) => s.account_id)}
              currency_symbol={currency_symbol}
              can_remove={splits.length > 1}
              onChange={(patch) => update(split.id, patch)}
              onRemove={() => remove(split.id)}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <AccountSplitSummary
              key={split.id}
              split={split}
              account={accounts.find((a) => a.id === split.account_id)}
              currency_symbol={currency_symbol}
              can_remove={splits.length > 1}
              onEdit={() => setEditingId(split.id)}
              onRemove={() => remove(split.id)}
            />
          ),
        )}

        {can_add && (
          <button
            type="button"
            onClick={add}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--form-accent)/30 bg-(--form-accent)/5 py-2.5 text-xs font-semibold text-(--form-accent) transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Split With Another Account
          </button>
        )}
      </div>
    </FormField>
  );
}