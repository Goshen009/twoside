import { useState } from "react";
// import { ArrowDown } from "lucide-react";
import DescriptionField from "./shared/DescriptionField";
import DateField from "./shared/DateField";
import AccountField from "./shared/AccountField";
import AmountField from "./shared/AmountField";
import PickerSheet, { type PickerItem } from "@/components/shared/PickerSheet";
import { useAccounts } from "@/hooks/accounts-context";
import { useFormErrors } from "@/hooks/useFormErrors";
import TransactionsApi from "@/lib/api/transactions";
import Format from "@/lib/format";

type TransferFormProps = {
  on_success: () => void;
};

export default function TransferForm({ on_success }: TransferFormProps) {
  const { accounts, refetch: refetch_accounts } = useAccounts();
  const { field_errors, banner_error, applyError, clear } = useFormErrors();

  const [description, set_description] = useState("");
  const [date, set_date] = useState(Format.todayDateStr());
  const [from_account_id, set_from_account_id] = useState<string | null>(null);
  const [to_account_id, set_to_account_id] = useState<string | null>(null);
  const [amount, set_amount] = useState("");
  const [active_picker, set_active_picker] = useState<"from" | "to" | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const from_account = accounts.find((a) => a.id === from_account_id);
  const to_account = accounts.find((a) => a.id === to_account_id);

  const account_picker_items: PickerItem[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: `₦${a.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clear();
    if (!from_account_id || !to_account_id) return;
    set_is_submitting(true);
    try {
      await TransactionsApi.logTransfer({
        description,
        trx_date: Format.toISODateTime(date),
        from_account_id,
        to_account_id,
        amount: parseFloat(amount) || 0,
        bypass_warnings: false,
      });
      await refetch_accounts();
      on_success();
    } catch (err) {
      applyError(err);
    } finally {
      set_is_submitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {banner_error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">{banner_error}</div>
      )}

      <DescriptionField value={description} on_change={set_description} placeholder="e.g., Transfer to savings, ATM withdrawal..." />
      {field_errors.description && <p className="text-[10px] text-red-400">{field_errors.description}</p>}

      <div className="grid grid-cols-2 gap-2.5">
        <AmountField value={amount} on_change={set_amount} />
        <DateField value={date} on_change={set_date} />
      </div>
      {field_errors.amount && <p className="text-[10px] text-red-400">{field_errors.amount}</p>}

      <div className="space-y-3">
        <AccountField label="Source Account" selected_account={from_account} on_click={() => set_active_picker("from")} />
        {field_errors.from_account_id && <p className="text-[10px] text-red-400">{field_errors.from_account_id}</p>}

        {/*<div className="flex justify-center -my-1 relative z-10">
          <div className="w-7 h-7 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted shadow-sm">
            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
          </div>
        </div>*/}

        <AccountField label="Destination Account" selected_account={to_account} on_click={() => set_active_picker("to")} />
        {field_errors.to_account_id && <p className="text-[10px] text-red-400">{field_errors.to_account_id}</p>}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface/60 border border-white/5 font-mono text-xs">
        <span className="text-muted text-[10px] uppercase tracking-wider">Transfer Amount</span>
        <span className="font-bold text-sky-400">₦{Format.formatMoney(amount || 0)}</span>
      </div>

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 disabled:opacity-50"
      >
        {is_submitting ? "Processing..." : "Complete Transfer"}
      </button>

      <PickerSheet
        is_open={active_picker !== null}
        title={active_picker === "from" ? "Select Source Account" : "Select Destination Account"}
        items={account_picker_items}
        selected_id={active_picker === "from" ? from_account_id ?? undefined : to_account_id ?? undefined}
        on_select={(id) => {
          if (active_picker === "from") set_from_account_id(id);
          if (active_picker === "to") set_to_account_id(id);
        }}
        on_close={() => set_active_picker(null)}
      />
    </form>
  );
}