import { useState } from "react";
import { Tag } from "lucide-react";
import DescriptionField from "./shared/DescriptionField";
import DateField from "./shared/DateField";
import AllocationsList from "./shared/AllocationsList";
import PickerSheet, { type PickerItem } from "../../../components/shared/PickerSheet";
import { useAllocations } from "../../../hooks/useAllocations";
import { useAccounts } from "../../../hooks/useAccounts";
import { useCategories } from "../../../hooks/useCategories";
import { useFormErrors } from "../../../hooks/useFormErrors";
import { useWarningBypass } from "../../../hooks/useWarningBypass";
import API from "../../../libs/api/api";
import Format from "../../../libs/format";

import WarningToast from "../../../components/shared/WarningToast";

type ExpenseFormProps = {
  on_success: () => void;
};

export default function ExpenseForm({ on_success }: ExpenseFormProps) {
  const { accounts, refetch: refetch_accounts } = useAccounts();
  const { categories, refetch: refetch_categories } = useCategories();
  const { field_errors, banner_error, applyError, clear } = useFormErrors();
  const { pending_warning, bypassed_codes, handleError, confirm, dismiss, reset } = useWarningBypass();

  const [description, set_description] = useState("");
  const [date, set_date] = useState(Format.todayDateStr());
  const [category_id, set_category_id] = useState<string | null>(null);
  const [active_picker, set_active_picker] = useState<"account" | "category" | null>(null);
  const [target_allocation_id, set_target_allocation_id] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const { allocations, addAllocation, removeAllocation, updateAccount, updateAmount, total } = useAllocations();

  const selected_category_name = category_id ? categories.find((c) => c.id === category_id)?.name : null;

  const account_picker_items: PickerItem[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: `₦${a.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  }));

  const category_picker_items: PickerItem[] = categories.map((c) => ({
    id: c.id,
    name: c.is_active ? c.name : `${c.name} (inactive)`,
  }));

  const [is_adding, set_is_adding] = useState(false);

  async function handleCreateCategory() {
    const name = window.prompt("Enter new category name:");
    if (!name) return;
    set_is_adding(true);
    try {
      const created = await API.createCategory(name);
      await refetch_categories();
      set_category_id(created.id);
      set_active_picker(null);
    } finally {
      set_is_adding(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clear();
    set_is_submitting(true);
    try {
      const codes = pending_warning ? confirm() : bypassed_codes;
      await API.logExpense({
        description,
        transaction_date: Format.toISODateTime(date),
        category_id,
        sources: allocations.map((a) => ({ account_id: a.account_id, amount: parseFloat(a.amount) || 0 })),
        bypass_warnings: codes,
      });
      refetch_accounts();
      reset();
      on_success();
    } catch (err) {
      if (!handleError(err)) applyError(err);
    } finally {
      set_is_submitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} onChangeCapture={dismiss} className="space-y-4 relative">
      {pending_warning && <WarningToast message={pending_warning.message} on_close={dismiss} />}

      {banner_error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs">{banner_error}</div>
      )}

      <DescriptionField value={description} on_change={set_description} placeholder="e.g., Grocery run, Coffee..." />
      {field_errors.description && <p className="text-[10px] text-red-400">{field_errors.description}</p>}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Category (Optional)</label>
          <button
            type="button"
            onClick={() => set_active_picker("category")}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className={`truncate ${selected_category_name ? "text-zinc-100" : "text-muted/50"}`}>
                {selected_category_name || "Select category"}
              </span>
            </div>
          </button>
        </div>
        <DateField value={date} on_change={set_date} />
      </div>

      <AllocationsList
        label="Source Accounts"
        add_label="Add Split Source"
        total_label="Total Expense"
        allocations={allocations}
        accounts={accounts}
        on_add={addAllocation}
        on_remove={removeAllocation}
        on_amount_change={updateAmount}
        on_open_account_picker={(id) => { set_target_allocation_id(id); set_active_picker("account"); }}
        total={total}
      />
      {field_errors.sources && <p className="text-[10px] text-red-400">{field_errors.sources}</p>}

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 disabled:opacity-50"
      >
        {is_submitting ? "Saving..." : pending_warning ? "Bypass & Save Expense" : "Save Expense"}
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
        is_open={active_picker === "category"}
        title="Select Category"
        items={category_picker_items}
        selected_id={category_id ?? undefined}
        on_select={(id) => set_category_id(id)}
        on_close={() => set_active_picker(null)}
        show_clear_option
        on_clear={() => set_category_id(null)}
        show_add_option
        add_label="Create new category"
        on_add_click={handleCreateCategory}
        is_adding={is_adding}
      />
    </form>
  );
}