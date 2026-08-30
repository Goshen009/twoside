import { useState } from "react";
import DescriptionField from "./shared/DescriptionField";
import DateField from "./shared/DateField";
import AllocationsList from "./shared/AllocationsList";
import PickerSheet, { type PickerItem } from "@/components/shared/PickerSheet";
import { useAllocations } from "@/hooks/useAllocations";
import { useAccounts } from "@/hooks/accounts-context";
import { useFormErrors } from "@/hooks/useFormErrors";
import TransactionsApi from "@/lib/api/transactions";
import Format from "@/lib/format";

type IncomeFormProps = {
  on_success: () => void;
};

export default function IncomeForm({ on_success }: IncomeFormProps) {
  const { accounts, refetch: refetch_accounts } = useAccounts();
  const { field_errors, banner_error, applyError, clear } = useFormErrors();

  const [description, set_description] = useState("");
  const [date, set_date] = useState(Format.todayDateStr());
  const [active_picker, set_active_picker] = useState<"account" | null>(null);
  const [target_allocation_id, set_target_allocation_id] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const { allocations, addAllocation, removeAllocation, updateAccount, updateAmount, total } = useAllocations();

  const account_picker_items: PickerItem[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: `₦${a.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clear();
    set_is_submitting(true);
    try {
      await TransactionsApi.logIncome({
        description,
        trx_date: Format.toISODateTime(date),
        destinations: allocations.map((a) => ({ account_id: a.account_id, amount: parseFloat(a.amount) || 0 })),
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

      <DescriptionField value={description} on_change={set_description} placeholder="e.g., Monthly Salary, Client payment..." />
      {field_errors.description && <p className="text-[10px] text-red-400">{field_errors.description}</p>}

      <DateField value={date} on_change={set_date} />

      <AllocationsList
        label="Destination Accounts"
        add_label="Add Split Destination"
        total_label="Total Income"
        total_color="text-emerald-400"
        allocations={allocations}
        accounts={accounts}
        on_add={addAllocation}
        on_remove={removeAllocation}
        on_amount_change={updateAmount}
        on_open_account_picker={(id) => { set_target_allocation_id(id); set_active_picker("account"); }}
        total={total}
      />
      {field_errors.destinations && <p className="text-[10px] text-red-400">{field_errors.destinations}</p>}

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 disabled:opacity-50"
      >
        {is_submitting ? "Saving..." : "Save Income"}
      </button>

      <PickerSheet
        is_open={active_picker === "account"}
        title="Select Account"
        items={account_picker_items}
        selected_id={target_allocation_id ? allocations.find((a) => a.id === target_allocation_id)?.account_id : undefined}
        on_select={(id) => { if (target_allocation_id) updateAccount(target_allocation_id, id); }}
        on_close={() => { set_active_picker(null); set_target_allocation_id(null); }}
      />
    </form>
  );
}