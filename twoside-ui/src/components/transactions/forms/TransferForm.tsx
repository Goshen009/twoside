import { useState } from "react";
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronRight } from "lucide-react";
import { ApiError } from "@/api/client";
import { TransactionsAPI } from "@/api/TransactionsApi";
import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useInfo } from "@/hooks/useInfo";
import { useWarningBypass } from "@/hooks/useWarningBypass";
import { FormatUtils } from "@/lib/FormatUtils";
import { transferFormSchema, type TransferFormValues } from "@/types/schemas";
import type { FieldPath } from "react-hook-form";
import type { InfoAccount, PickerItem, TransferFormProps } from "@/types/types";
import { DescriptionField } from "@/components/transactions/forms/shared/DescriptionField";
import { DateTimeField } from "@/components/transactions/forms/shared/DateTimeField";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { WarningToast } from "@/components/ui/WarningToast";

type TransferPickerSide = "from" | "to";

const CARD_CLASSES =
  "overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]";

type AccountSideRowProps = {
  side_label: "From" | "To";
  account: InfoAccount | undefined;
  currency: string;
  error?: string;
  on_click: () => void;
};

/** One fixed side of a transfer (From or To): label + account button. */
function AccountSideRow({
  side_label,
  account,
  currency,
  error,
  on_click,
}: AccountSideRowProps) {
  return (
    <div className="px-4 py-1">
      <button
        type="button"
        onClick={on_click}
        className="flex w-full cursor-pointer items-center gap-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--form-accent)/30"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
            {side_label}
          </span>
          <span
            className={`block truncate text-xs ${
              account ? "font-medium text-zinc-100" : "text-muted/60"
            }`}
          >
            {account ? account.name : "Select account"}
          </span>
          {account ? (
            <span className="block truncate text-[10px] text-muted/60">
              Balance {currency}
              {FormatUtils.formatMoney(account.balance)}
            </span>
          ) : null}
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/40" />
      </button>
      {error ? (
        <p className="px-1 pb-1 text-[11px] text-red-400">{error}</p>
      ) : null}
    </div>
  );
}

export function TransferForm({ on_success }: TransferFormProps) {
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
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      description: "",
      transaction_date: FormatUtils.nowLocalValue(),
      amount: "",
      charge: "",
      from_account_id: "",
      to_account_id: "",
    },
  });

  const [is_submitting, set_is_submitting] = useState(false);
  const [banner_error, set_banner_error] = useState<string | null>(null);
  const [active_picker, set_active_picker] = useState<TransferPickerSide | null>(
    null,
  );

  const values = watch();

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-xs text-muted">Loading accounts…</p>
      </div>
    );
  }

  const { currency_symbol: currency, accounts } = data;
  const from_account_id = values.from_account_id ?? "";
  const to_account_id = values.to_account_id ?? "";
  const from_account = accounts.find(
    (account) => account.id === from_account_id,
  );
  const to_account = accounts.find((account) => account.id === to_account_id);

  const account_items: PickerItem[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    subtitle: `${currency}${FormatUtils.formatMoney(account.balance)}`,
  }));

  function dismiss_on_edit(): void {
    if (pending_warning) dismissWarning();
  }

  function apply_server_errors(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.fields && err.fields.length > 0) {
        for (const field_error of err.fields) {
          const name = field_error.field.replaceAll("/", ".");
          setError(name as FieldPath<TransferFormValues>, {
            type: "server",
            message: field_error.message,
          });
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

  async function onSubmit(raw: TransferFormValues): Promise<void> {
    clearErrors();
    set_banner_error(null);
    set_is_submitting(true);
    const codes = pending_warning ? confirmWarning() : bypassed_codes;
    try {
      await TransactionsAPI.logTransfer({
        description: raw.description,
        transaction_date: FormatUtils.toUtcIso(raw.transaction_date),
        from_account_id: raw.from_account_id,
        to_account_id: raw.to_account_id,
        amount: Number(raw.amount),
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

  /**
   * Same-account guard: pickers always list every account, but tapping the
   * account already chosen on the OTHER side moves it to this side and clears
   * the other side — never the same account on both, no hidden swap. Re-picking
   * the current side's own account is a no-op.
   */
  function choose_account(side: TransferPickerSide, id: string): void {
    const current_from = values.from_account_id ?? "";
    const current_to = values.to_account_id ?? "";
    const other_side = side === "from" ? current_to : current_from;

    if (id === other_side) {
      // Chose the other side's account: take it here, empty the other side.
      if (side === "from") {
        setValue("from_account_id", id, { shouldValidate: false });
        setValue("to_account_id", "", { shouldValidate: false });
      } else {
        setValue("to_account_id", id, { shouldValidate: false });
        setValue("from_account_id", "", { shouldValidate: false });
      }
    } else if (side === "from") {
      setValue("from_account_id", id, { shouldValidate: false });
    } else {
      setValue("to_account_id", id, { shouldValidate: false });
    }
    clearErrors();
    dismiss_on_edit();
  }

  function handleAmountChange(value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setValue("amount", sanitized, { shouldValidate: false });
    clearErrors();
    dismiss_on_edit();
  }

  function handleChargeChange(value: string): void {
    const sanitized = FormatUtils.sanitizeAmountInput(value);
    setValue("charge", sanitized, { shouldValidate: false });
    clearErrors();
    dismiss_on_edit();
  }

  function open_picker(side: TransferPickerSide): void {
    set_active_picker(side);
  }

  function close_picker(): void {
    set_active_picker(null);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
      style={{
        "--form-accent": TRANSACTION_TYPE_META.transfer.accent,
      } as CSSProperties}
    >
      {banner_error ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{banner_error}</span>
        </div>
      ) : null}

      {pending_warning ? (
        <WarningToast message={pending_warning.message} on_close={dismissWarning} />
      ) : null}

      <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]">
        <DescriptionField
          label="Description"
          placeholder="What is this transfer for?"
          error={errors.description?.message}
          {...register("description")}
        />

        <DateTimeField
          error={errors.transaction_date?.message}
          {...register("transaction_date")}
          value={values.transaction_date ?? ""}
        />
      </div>

      <div className={CARD_CLASSES}>
        <div className="divide-y divide-white/5">
          <AccountSideRow
            side_label="From"
            account={from_account}
            currency={currency}
            error={errors.from_account_id?.message}
            on_click={() => open_picker("from")}
          />
          <AccountSideRow
            side_label="To"
            account={to_account}
            currency={currency}
            error={errors.to_account_id?.message}
            on_click={() => open_picker("to")}
          />
        </div>

        <div className="border-t border-white/5 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Amount
            </p>
            <label className="flex shrink-0 items-baseline gap-1 rounded-lg px-1 py-1 transition-colors focus-within:bg-white/[0.03]">
              <span className="text-[10px] text-muted/70">{currency}</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-label="Amount"
                value={values.amount ?? ""}
                onChange={(event) => handleAmountChange(event.target.value)}
                className="w-24 border-b border-transparent bg-transparent pb-0.5 text-right text-xs font-semibold tabular-nums text-zinc-100 placeholder:text-muted/40 transition-colors focus:border-(--form-accent)/50 focus:outline-none"
              />
            </label>
          </div>
          {errors.amount ? (
            <p className="mt-0.5 pl-1 text-[11px] text-red-400">
              {errors.amount.message}
            </p>
          ) : null}
        </div>

        <div className="border-t border-white/5 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Charge
            </p>
            <label className="flex shrink-0 items-baseline gap-1 rounded-lg px-1 py-1 transition-colors focus-within:bg-white/[0.03]">
              <span className="text-[10px] text-muted/70">{currency}</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                aria-label="Charge"
                value={values.charge ?? ""}
                onChange={(event) => handleChargeChange(event.target.value)}
                className="w-24 border-b border-transparent bg-transparent pb-0.5 text-right text-xs font-semibold tabular-nums text-zinc-100 placeholder:text-muted/40 transition-colors focus:border-(--form-accent)/50 focus:outline-none"
              />
            </label>
          </div>
          {errors.charge ? (
            <p className="mt-0.5 pl-1 text-[11px] text-red-400">
              {errors.charge.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={is_submitting}
        className="w-full cursor-pointer rounded-2xl bg-(--form-accent) py-3 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {is_submitting ? (
          <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
        ) : pending_warning ? (
          "Bypass & Record Transfer"
        ) : (
          "Record Transfer"
        )}
      </button>

      <PickerSheet
        open={active_picker === "from"}
        title="Transfer from"
        accent_color={TRANSACTION_TYPE_META.transfer.accent}
        items={account_items}
        selected_id={active_picker === "from" ? from_account_id || null : null}
        on_select={(id) => choose_account("from", id)}
        on_close={close_picker}
        empty_message="No accounts found"
      />

      <PickerSheet
        open={active_picker === "to"}
        title="Transfer to"
        accent_color={TRANSACTION_TYPE_META.transfer.accent}
        items={account_items}
        selected_id={active_picker === "to" ? to_account_id || null : null}
        on_select={(id) => choose_account("to", id)}
        on_close={close_picker}
        empty_message="No accounts found"
      />
    </form>
  );
}
