import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Tag } from "lucide-react";
import { ApiError } from "@/api/client";
import { TransactionsAPI } from "@/api/TransactionsApi";
import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useInfo } from "@/hooks/useInfo";
import { useWarningBypass } from "@/hooks/useWarningBypass";
import { FormatUtils } from "@/lib/FormatUtils";
import { expenseFormSchema, type ExpenseFormValues } from "@/types/schemas";
import type { FieldPath } from "react-hook-form";
import type {
  AllocationRowData,
  ExpenseFormProps,
  ExpensePickerTarget,
  PickerItem,
} from "@/types/types";
import { DescriptionField } from "@/components/transactions/forms/shared/DescriptionField";
import { DateTimeField } from "@/components/transactions/forms/shared/DateTimeField";
import { AllocationsList } from "@/components/transactions/forms/shared/AllocationsList";
import { NameField } from "@/components/transactions/forms/shared/NameField";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { WarningToast } from "@/components/ui/WarningToast";

type SourceRow = ExpenseFormValues["sources"][number];

type SourcesErrors = {
  message?: string;
  root?: { message?: string };
  [index: number]:
    | {
        account_id?: { message?: string };
        amount?: { message?: string };
        charge?: { message?: string };
      }
    | undefined;
};

const BLANK_SOURCE: SourceRow = { account_id: "", amount: "", charge: "" };

export function ExpenseForm({ on_success }: ExpenseFormProps) {
  const { data, refetch } = useInfo();
  const {
    pending_warning,
    bypassed_codes,
    handleError,
    confirmWarning,
    dismissWarning,
    resetWarnings,
  } = useWarningBypass();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      transaction_date: FormatUtils.nowLocalValue(),
      category_name: null,
      sources: [{ ...BLANK_SOURCE }],
    },
  });

  const [is_submitting, set_is_submitting] = useState(false);
  const [banner_error, set_banner_error] = useState<string | null>(null);
  const [active_picker, set_active_picker] = useState<ExpensePickerTarget | null>(
    null,
  );

  // Sources rows are value-managed (whole-array `setValue`, no per-row register),
  // so materialize the array in RHF's store once on mount. Guarantees the schema
  // resolver always sees `sources` present, even before the user edits a row.
  const sources_seeded = useRef(false);
  useEffect(() => {
    if (sources_seeded.current) return;
    sources_seeded.current = true;
    setValue("sources", [{ ...BLANK_SOURCE }], { shouldValidate: false });
  }, [setValue]);

  // Reactively tracks the whole form; the sources array below is value-managed
  // (kept in sync with `setValue` whole-array writes) so rows can be fully
  // controlled by AllocationsList.
  const values = watch();

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-xs text-muted">Loading accounts…</p>
      </div>
    );
  }

  const { currency_symbol: currency, accounts, categories } = data;

  const source_rows: SourceRow[] =
    values.sources && values.sources.length > 0 ? values.sources : [BLANK_SOURCE];
  const rows: AllocationRowData[] = source_rows.map((source, index) => ({
    key: String(index),
    account_id: source.account_id ?? "",
    amount: source.amount ?? "",
    charge: source.charge ?? "",
  }));

  const total = rows.reduce((sum, row) => {
    const amount = Number(row.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  const account_items: PickerItem[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    subtitle: `${currency}${FormatUtils.formatMoney(account.balance)}`,
  }));

  const category_items: PickerItem[] = categories.map((category) => ({
    id: category.name,
    name: category.name,
  }));

  /** Accounts a row can still pick: everything except accounts already assigned
   *  to OTHER rows. Hides duplicates instead of letting them trigger a
   *  submit-time "same account" warning. */
  function account_items_for(row_index: number): PickerItem[] {
    const taken = new Set<string>();
    rows.forEach((row, i) => {
      if (i !== row_index && row.account_id) taken.add(row.account_id);
    });
    return account_items.filter((item) => !taken.has(item.id));
  }

  function dismiss_on_edit(): void {
    if (pending_warning) dismissWarning();
  }

  function sources_error_message(): string | undefined {
    const node = errors.sources as unknown as SourcesErrors | undefined;
    return node?.root?.message ?? node?.message;
  }

  function rowError(
    index: number,
    key: "account_id" | "amount" | "charge",
  ): string | undefined {
    const node = errors.sources as unknown as SourcesErrors | undefined;
    const entry = node?.[index];
    if (key === "account_id") return entry?.account_id?.message;
    if (key === "amount") return entry?.amount?.message;
    return entry?.charge?.message;
  }

  function apply_server_errors(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.fields && err.fields.length > 0) {
        for (const field_error of err.fields) {
          const name = field_error.field.replaceAll("/", ".");
          if (name === "sources") {
            setError("sources", { type: "server", message: field_error.message });
          } else {
            setError(name as FieldPath<ExpenseFormValues>, {
              type: "server",
              message: field_error.message,
            });
          }
        }
        return;
      }
      set_banner_error(
        err.message || "Something went wrong. Please try again.",
      );
      return;
    }
    set_banner_error("Something went wrong. Please try again.");
  }

  async function onSubmit(raw: ExpenseFormValues): Promise<void> {
    clearErrors();
    set_banner_error(null);
    set_is_submitting(true);
    const codes = pending_warning ? confirmWarning() : bypassed_codes;
    try {
      await TransactionsAPI.logExpense({
        description: raw.description,
        transaction_date: FormatUtils.toUtcIso(raw.transaction_date),
        category_name: raw.category_name?.trim() || null,
        sources: raw.sources.map((row) => ({
          account_id: row.account_id,
          amount: Number(row.amount),
          charge: Number(row.charge) || 0,
        })),
        bypass_warnings: codes,
      });
      await refetch();
      resetWarnings();
      reset();
      on_success();
    } catch (err) {
      if (!handleError(err)) apply_server_errors(err);
    } finally {
      set_is_submitting(false);
    }
  }

  function setSources(next: SourceRow[]): void {
    setValue("sources", next, { shouldValidate: false });
  }

  function handle_account_click(index: number): void {
    set_active_picker({ kind: "account", row_index: index });
  }

  function handle_category_click(): void {
    set_active_picker({ kind: "category" });
  }

  function handle_account_select(id: string): void {
    const target = active_picker;
    if (target?.kind === "account") {
      const index = target.row_index;
      setSources(
        source_rows.map((row, i) => (i === index ? { ...row, account_id: id } : row)),
      );
    }
    clearErrors();
    dismiss_on_edit();
  }

  function handle_category_select(name: string): void {
    setValue("category_name", name);
    clearErrors();
    dismiss_on_edit();
  }

  function handle_category_none(): void {
    setValue("category_name", null);
    clearErrors();
    dismiss_on_edit();
  }

  function handle_add_row(): void {
    setSources([...source_rows, { ...BLANK_SOURCE }]);
    dismiss_on_edit();
  }

  function handle_remove_row(index: number): void {
    if (source_rows.length > 1) {
      setSources(source_rows.filter((_, i) => i !== index));
    }
    dismiss_on_edit();
  }

  function handleAmountChange(index: number, value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setSources(
      source_rows.map((row, i) =>
        i === index ? { ...row, amount: sanitized } : row,
      ),
    );
    clearErrors();
    dismiss_on_edit();
  }

  function handleChargeChange(index: number, value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setSources(
      source_rows.map((row, i) =>
        i === index ? { ...row, charge: sanitized } : row,
      ),
    );
    clearErrors();
    dismiss_on_edit();
  }

  function close_picker(): void {
    set_active_picker(null);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      style={{ "--form-accent": TRANSACTION_TYPE_META.expense.accent } as CSSProperties}
    >
      {banner_error ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{banner_error}</span>
        </div>
      ) : null}

      {pending_warning ? (
        <WarningToast
          message={pending_warning.message}
          on_close={dismissWarning}
        />
      ) : null}

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
        <DescriptionField
          label="Description"
          placeholder="What did you spend this on?"
          error={errors.description?.message}
          {...register("description")}
        />

        <DateTimeField
          error={errors.transaction_date?.message}
          {...register("transaction_date")}
          value={values.transaction_date ?? ""}
        />

        <NameField
          icon={Tag}
          value={values.category_name ?? null}
          placeholder="Categorize this as…"
          optional_label="Optional"
          error={errors.category_name?.message}
          on_click={handle_category_click}
        />
      </div>

      <AllocationsList
        add_label="Add account"
        total_label="Total"
        rows={rows}
        accounts={accounts}
        currency={currency}
        accent_color={TRANSACTION_TYPE_META.expense.accent}
        account_placeholder="Select account to spend from"
        total={total}
        on_add={handle_add_row}
        on_remove={handle_remove_row}
        on_account_click={handle_account_click}
        on_amount_change={handleAmountChange}
        on_charge_change={handleChargeChange}
        charge_effect="add"
        combined_label="Total paid"
        root_error={sources_error_message()}
        row_error={rowError}
      />

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full cursor-pointer rounded-2xl bg-(--form-accent) py-3 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {is_submitting ? (
          <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : pending_warning ? (
          "Bypass & Record Expense"
        ) : (
          "Record Expense"
        )}
      </button>

      <PickerSheet
        open={active_picker?.kind === "account"}
        title="Select account to spend from"
        accent_color={TRANSACTION_TYPE_META.expense.accent}
        items={
          active_picker?.kind === "account"
            ? account_items_for(active_picker.row_index)
            : account_items
        }
        selected_id={
          active_picker?.kind === "account"
            ? source_rows[active_picker.row_index]?.account_id ?? null
            : null
        }
        on_select={handle_account_select}
        on_close={close_picker}
        empty_message="No accounts found"
      />

      <PickerSheet
        open={active_picker?.kind === "category"}
        title="Categorize this as…"
        accent_color={TRANSACTION_TYPE_META.expense.accent}
        items={category_items}
        selected_id={values.category_name ?? null}
        show_none
        none_label="None / Clear"
        on_none={handle_category_none}
        show_create
        create_label="Create new…"
        create_placeholder="New category name"
        on_create={handle_category_select}
        on_select={handle_category_select}
        on_close={close_picker}
        empty_message="No categories yet"
      />
    </form>
  );
}
