import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { ApiError } from "@/api/client";
import { TransactionsAPI } from "@/api/TransactionsApi";
import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useInfo } from "@/hooks/useInfo";
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
    | { account_id?: { message?: string }; amount?: { message?: string } }
    | undefined;
};

const BLANK_DESTINATION: DestinationRow = { account_id: "", amount: "" };

/** Enforce the amount schema's max of 2 decimal places while typing:
 *  keeps only digits + a single dot, truncates the fraction to 2. */
function sanitize_amount_input(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [integer, ...rest] = cleaned.split(".");
  if (rest.length === 0) return cleaned;
  const fraction = rest.join("").slice(0, 2);
  return `${integer}.${fraction}`;
}

export function IncomeForm({ on_success }: IncomeFormProps) {
  const { data, refetch } = useInfo();

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

  const { currency, accounts } = data;

  const destination_rows: DestinationRow[] =
    values.destinations && values.destinations.length > 0
      ? values.destinations
      : [BLANK_DESTINATION];
  const rows: AllocationRowData[] = destination_rows.map(
    (destination, index) => ({
      key: String(index),
      account_id: destination.account_id ?? "",
      amount: destination.amount ?? "",
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

  function destinations_error_message(): string | undefined {
    const node = errors.destinations as unknown as DestinationsErrors | undefined;
    return node?.root?.message ?? node?.message;
  }

  function row_error(
    index: number,
    key: "account_id" | "amount",
  ): string | undefined {
    const node = errors.destinations as unknown as DestinationsErrors | undefined;
    const entry = node?.[index];
    return key === "account_id" ? entry?.account_id?.message : entry?.amount?.message;
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
        })),
      });
      await refetch();
      reset();
      on_success();
    } catch (err) {
      apply_server_errors(err);
    } finally {
      set_is_submitting(false);
    }
  }

  function set_destinations(next: DestinationRow[]): void {
    setValue("destinations", next, { shouldValidate: false });
  }

  function handle_account_click(index: number): void {
    set_picker_row(index);
  }

  function handle_account_select(id: string): void {
    if (picker_row !== null) {
      const index = picker_row;
      set_destinations(
        destination_rows.map((row, i) =>
          i === index ? { ...row, account_id: id } : row,
        ),
      );
    }
    clearErrors();
  }

  function handle_add_row(): void {
    set_destinations([...destination_rows, { ...BLANK_DESTINATION }]);
  }

  function handle_remove_row(index: number): void {
    if (destination_rows.length > 1) {
      set_destinations(destination_rows.filter((_, i) => i !== index));
    }
  }

  function handle_amount_change(index: number, value: string): void {
    const sanitized = sanitize_amount_input(value);
    set_destinations(
      destination_rows.map((row, i) =>
        i === index ? { ...row, amount: sanitized } : row,
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
        account_placeholder="Select account to deposit to"
        total={total}
        on_add={handle_add_row}
        on_remove={handle_remove_row}
        on_account_click={handle_account_click}
        on_amount_change={handle_amount_change}
        root_error={destinations_error_message()}
        row_error={row_error}
      />

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full cursor-pointer rounded-2xl bg-(--form-accent) py-3 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {is_submitting ? (
          <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : (
          "Save Income"
        )}
      </button>

      <PickerSheet
        open={picker_row !== null}
        title="Select account"
        items={account_items}
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
