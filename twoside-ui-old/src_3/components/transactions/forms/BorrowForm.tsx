import { useState } from "react";
import DescriptionField from "./shared/DescriptionField";
import DateField from "./shared/DateField";
import CounterpartyField from "./shared/CounterpartyField";
import AllocationsList from "./shared/AllocationsList";
import PickerSheet, { type PickerItem } from "@/components/shared/PickerSheet";
import { useAllocations } from "@/hooks/useAllocations";
import { useAccounts } from "@/hooks/accounts-context";
import { useCounterparties } from "@/hooks/useCounterparties";
import { useFormErrors } from "@/hooks/useFormErrors";
import TransactionsApi from "@/lib/api/transactions";
import CounterpartiesApi from "@/lib/api/counterparties";
import Format from "@/lib/format";

type BorrowFormProps = {
  on_success: () => void;
};

export default function BorrowForm({ on_success }: BorrowFormProps) {
  const { accounts, refetch: refetch_accounts } = useAccounts();
  const { counterparties, refetch: refetch_counterparties } = useCounterparties();
  const { field_errors, banner_error, applyError, clear } = useFormErrors();

  const [description, set_description] = useState("");
  const [date, set_date] = useState(Format.todayDateStr());
  const [counterparty_id, set_counterparty_id] = useState<string | null>(null);
  const [active_picker, set_active_picker] = useState<"account" | "counterparty" | null>(null);
  const [target_allocation_id, set_target_allocation_id] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const { allocations, addAllocation, removeAllocation, updateAccount, updateAmount, total } = useAllocations();

  const selected_counterparty_name = counterparty_id
    ? counterparties.find((c) => c.id === counterparty_id)?.name
    : null;

  const account_picker_items: PickerItem[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: `₦${a.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  }));

  const counterparty_picker_items: PickerItem[] = counterparties.map((c) => ({
    id: c.id,
    name: c.is_active ? c.name : `${c.name} (inactive)`,
  }));

  async function handleCreateCounterparty() {
    const name = window.prompt("Enter lender's name:");
    if (!name) return;
    const created = await CounterpartiesApi.create(name);
    await refetch_counterparties();
    set_counterparty_id(created.id);
    set_active_picker(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clear();
    if (!counterparty_id) return;
    set_is_submitting(true);
    try {
      await TransactionsApi.logBorrow({
        description,
        trx_date: Format.toISODateTime(date),
        counterparty_id,
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

      <DescriptionField value={description} on_change={set_description} placeholder="e.g., Short-term liquidity support..." />
      {field_errors.description && <p className="text-[10px] text-red-400">{field_errors.description}</p>}

      <div className="grid grid-cols-2 gap-2.5">
        <CounterpartyField
          label="Counterparty"
          selected_name={selected_counterparty_name}
          placeholder="Select lender"
          on_click={() => set_active_picker("counterparty")}
        />
        <DateField value={date} on_change={set_date} />
      </div>
      {field_errors.counterparty_id && <p className="text-[10px] text-red-400">{field_errors.counterparty_id}</p>}

      <AllocationsList
        label="Destination Accounts"
        add_label="Add Split Destination"
        total_label="Total Borrowed"
        total_color="text-amber-400"
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
        {is_submitting ? "Saving..." : "Save Borrowing"}
      </button>

      <PickerSheet
        is_open={active_picker === "account"}
        title="Select Account"
        items={account_picker_items}
        selected_id={target_allocation_id ? allocations.find((a) => a.id === target_allocation_id)?.account_id : undefined}
        on_select={(id) => { if (target_allocation_id) updateAccount(target_allocation_id, id); }}
        on_close={() => { set_active_picker(null); set_target_allocation_id(null); }}
      />

      <PickerSheet
        is_open={active_picker === "counterparty"}
        title="Select Lender"
        items={counterparty_picker_items}
        selected_id={counterparty_id ?? undefined}
        on_select={(id) => set_counterparty_id(id)}
        on_close={() => set_active_picker(null)}
        show_add_option
        add_label="Add new counterparty"
        on_add_click={handleCreateCounterparty}
      />
    </form>
  );
}