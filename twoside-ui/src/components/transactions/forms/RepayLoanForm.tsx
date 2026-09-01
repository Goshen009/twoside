import { useState } from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import DescriptionField from "./shared/DescriptionField";
import DateField from "./shared/DateField";
import AllocationsList from "./shared/AllocationsList";
import LoanPickerSheet from "../../../components/shared/LoanPickerSheet";
import PickerSheet, { type PickerItem } from "../../../components/shared/PickerSheet";
import WarningToast from "../../../components/shared/WarningToast";
import { useAllocations } from "../../../hooks/useAllocations";
import { useAccounts } from "../../../hooks/useAccounts";
import { useFormErrors } from "../../../hooks/useFormErrors";
import { useLoans } from "../../../hooks/useLoans";
import { useWarningBypass } from "../../../hooks/useWarningBypass";
import API from "../../../libs/api/api";
import Format from "../../../libs/format";

type RepayLoanFormProps = {
  on_success: () => void;
};

export default function RepayLoanForm({ on_success }: RepayLoanFormProps) {
  const { accounts, refetch: refetch_accounts } = useAccounts();
  const { loans } = useLoans("BORROWED");
  const { field_errors, banner_error, applyError, clear } = useFormErrors();
  const { pending_warning, bypassed_codes, handleError, confirm, dismiss, reset } = useWarningBypass();

  const [description, set_description] = useState("");
  const [date, set_date] = useState(Format.todayDateStr());
  const [loan_id, set_loan_id] = useState<string | null>(null);
  const [active_picker, set_active_picker] = useState<"loan" | "account" | null>(null);
  const [target_allocation_id, set_target_allocation_id] = useState<string | null>(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const { allocations, addAllocation, removeAllocation, updateAccount, updateAmount, total } = useAllocations();

  const selected_loan = loans.find((l) => l.id === loan_id);

  const account_picker_items: PickerItem[] = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    subtitle: `₦${a.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clear();
    if (!loan_id) return;
    set_is_submitting(true);
    try {
      const codes = pending_warning ? confirm() : bypassed_codes;
      await API.logRepayLoan({
        description,
        transaction_date: Format.toISODateTime(date),
        loan_id,
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

      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Select Loan to Repay</label>
        <button
          type="button"
          onClick={() => set_active_picker("loan")}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
        >
          <div className="flex items-center gap-2 truncate">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-zinc-100 truncate">
              {selected_loan
                ? `${selected_loan.counterparty_name} — ₦${Format.formatMoney(selected_loan.amount - selected_loan.total_repaid)} outstanding`
                : "Select active loan..."}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
        </button>
        {field_errors.loan_id && <p className="text-[10px] text-red-400">{field_errors.loan_id}</p>}
      </div>

      <DescriptionField value={description} on_change={set_description} placeholder="e.g., Final balance clearance..." />
      {field_errors.description && <p className="text-[10px] text-red-400">{field_errors.description}</p>}

      <DateField value={date} on_change={set_date} />

      <AllocationsList
        label="Source Accounts"
        add_label="Add Split Source"
        total_label="Total Repayment"
        total_color="text-amber-400"
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
        {is_submitting ? "Saving..." : pending_warning ? "Bypass & Save Repayment" : "Save Repayment"}
      </button>

      <LoanPickerSheet
        is_open={active_picker === "loan"}
        title="Select Loan"
        loans={loans}
        selected_loan_id={loan_id}
        amount_color="text-amber-400"
        on_select={set_loan_id}
        on_close={() => set_active_picker(null)}
      />

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