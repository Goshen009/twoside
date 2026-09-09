import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { ApiError } from "@/api/client";
import { TransactionsAPI } from "@/api/TransactionsApi";
import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useInfo } from "@/hooks/useInfo";
import { useTransactions } from "@/hooks/useTransactions";
import { FormatUtils } from "@/lib/FormatUtils";
import { incomeFormSchema, type IncomeFormValues } from "@/types/schemas";
import type { FieldPath } from "react-hook-form";
import type {
  AllocationRowData,
  IncomeFormProps,
  PickerItem,
} from "@/types/types";
import { DescriptionField } from "@/components/transactions/forms/shared/DescriptionField";
import { DateTimeField } from "@/components/transactions/forms/shared/DateTimeField";
import { AllocationsList } from "@/components/transactions/forms/shared/AllocationsList";
import { PickerSheet } from "@/components/ui/PickerSheet";

type DestinationRow = IncomeFormValues["destinations"][number];

type DestinationsErrors = {
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

const BLANK_DESTINATION: DestinationRow = {
  account_id: "",
  amount: "",
  charge: "",
};

export function IncomeForm({ on_success }: IncomeFormProps) {
  const { data, refetch } = useInfo();
  const { refetch: refetch_transactions } = useTransactions();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: "",
      transaction_date: FormatUtils.nowLocalValue(),
      destinations: [{ ...BLANK_DESTINATION }],
    },
  });

  const [is_submitting, set_is_submitting] = useState(false);
  const [banner_error, set_banner_error] = useState<string | null>(null);
  const [picker_row, set_picker_row] = useState<number | null>(null);

  // Destinations rows are value-managed (whole-array `setValue`, no per-row
  // register), so materialize the array in RHF's store once on mount.
  // Guarantees the schema resolver always sees `destinations` present.
  const destinations_seeded = useRef(false);
  useEffect(() => {
    if (destinations_seeded.current) return;
    destinations_seeded.current = true;
    setValue("destinations", [{ ...BLANK_DESTINATION }], {
      shouldValidate: false,
    });
  }, [setValue]);

  const values = watch();

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-xs text-muted">Loading accounts…</p>
      </div>
    );
  }

  const { currency_symbol: currency, accounts } = data;

  const destination_rows: DestinationRow[] =
    values.destinations && values.destinations.length > 0
      ? values.destinations
      : [BLANK_DESTINATION];
  const rows: AllocationRowData[] = destination_rows.map(
    (destination, index) => ({
      key: String(index),
      account_id: destination.account_id ?? "",
      amount: destination.amount ?? "",
      charge: destination.charge ?? "",
    }),
  );

  const total = rows.reduce((sum, row) => {
    const amount = Number(row.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  const account_items: PickerItem[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    subtitle: `${currency}${FormatUtils.formatMoney(account.balance)}`,
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

  function destinations_error_message(): string | undefined {
    const node = errors.destinations as unknown as DestinationsErrors | undefined;
    return node?.root?.message ?? node?.message;
  }

  function rowError(
    index: number,
    key: "account_id" | "amount" | "charge",
  ): string | undefined {
    const node = errors.destinations as unknown as DestinationsErrors | undefined;
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
          if (name === "destinations") {
            setError("destinations", {
              type: "server",
              message: field_error.message,
            });
          } else {
            setError(name as FieldPath<IncomeFormValues>, {
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

  async function onSubmit(raw: IncomeFormValues): Promise<void> {
    clearErrors();
    set_banner_error(null);
    set_is_submitting(true);
    try {
      await TransactionsAPI.logIncome({
        description: raw.description,
        transaction_date: FormatUtils.toUtcIso(raw.transaction_date),
        destinations: raw.destinations.map((row) => ({
          account_id: row.account_id,
          amount: Number(row.amount),
          charge: Number(row.charge) || 0,
        })),
      });
      const touched_account_ids = [
        ...new Set(raw.destinations.map((row) => row.account_id)),
      ];
      await Promise.all([
        refetch(),
        refetch_transactions(touched_account_ids),
      ]);
      reset();
      on_success();
    } catch (err) {
      apply_server_errors(err);
    } finally {
      set_is_submitting(false);
    }
  }

  function setDestinations(next: DestinationRow[]): void {
    setValue("destinations", next, { shouldValidate: false });
  }

  function handle_account_click(index: number): void {
    set_picker_row(index);
  }

  function handle_account_select(id: string): void {
    if (picker_row !== null) {
      const index = picker_row;
      setDestinations(
        destination_rows.map((row, i) =>
          i === index ? { ...row, account_id: id } : row,
        ),
      );
    }
    clearErrors();
  }

  function handle_add_row(): void {
    setDestinations([...destination_rows, { ...BLANK_DESTINATION }]);
  }

  function handle_remove_row(index: number): void {
    if (destination_rows.length > 1) {
      setDestinations(destination_rows.filter((_, i) => i !== index));
    }
  }

  function handleAmountChange(index: number, value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setDestinations(
      destination_rows.map((row, i) =>
        i === index ? { ...row, amount: sanitized } : row,
      ),
    );
    clearErrors();
  }

  function handleChargeChange(index: number, value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setDestinations(
      destination_rows.map((row, i) =>
        i === index ? { ...row, charge: sanitized } : row,
      ),
    );
    clearErrors();
  }

  function close_picker(): void {
    set_picker_row(null);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      style={{
        "--form-accent": TRANSACTION_TYPE_META.income.accent,
      } as CSSProperties}
    >
      {banner_error ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{banner_error}</span>
        </div>
      ) : null}

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
        <DescriptionField
          label="Description"
          placeholder="What is this income for?"
          error={errors.description?.message}
          {...register("description")}
        />

        <DateTimeField
          error={errors.transaction_date?.message}
          {...register("transaction_date")}
          value={values.transaction_date ?? ""}
        />
      </div>

      <AllocationsList
        add_label="Add account"
        total_label="Total"
        rows={rows}
        accounts={accounts}
        currency={currency}
        accent_color={TRANSACTION_TYPE_META.income.accent}
        account_placeholder="Select account to receive into"
        total={total}
        on_add={handle_add_row}
        on_remove={handle_remove_row}
        on_account_click={handle_account_click}
        on_amount_change={handleAmountChange}
        on_charge_change={handleChargeChange}
        charge_effect="subtract"
        combined_label="Net received"
        root_error={destinations_error_message()}
        row_error={rowError}
      />

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full cursor-pointer rounded-2xl bg-(--form-accent) py-3 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {is_submitting ? (
          <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : (
          "Record Income"
        )}
      </button>

      <PickerSheet
        open={picker_row !== null}
        title="Select account to receive into"
        accent_color={TRANSACTION_TYPE_META.income.accent}
        items={picker_row !== null ? account_items_for(picker_row) : account_items}
        selected_id={
          picker_row !== null
            ? destination_rows[picker_row]?.account_id ?? null
            : null
        }
        on_select={handle_account_select}
        on_close={close_picker}
        empty_message="No accounts found"
      />
    </form>
  );
}
