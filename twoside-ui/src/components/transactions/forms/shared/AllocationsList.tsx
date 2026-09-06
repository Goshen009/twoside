import { ChevronRight, Plus, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { FormatUtils } from "@/lib/FormatUtils";
import type {
  AllocationRowData,
  AllocationsListProps,
  InfoAccount,
} from "@/types/types";

const CARD_CLASSES =
  "overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03]";
const OVERLINE_CLASSES =
  "text-[10px] font-semibold uppercase tracking-wider text-muted";
// Fall back to the app-wide primary (green) so callers that don't theme the
// list (e.g. future income, which shares the primary accent) pass nothing.
const DEFAULT_ACCENT = "var(--color-primary)";

function account_for(accounts: InfoAccount[], account_id: string) {
  return accounts.find((account) => account.id === account_id);
}

/** One compact money field in a row's Amount/Charge pair. Right-aligned so the
 *  digits line up across every row no matter how long the account names are. */
function MoneyCell({
  label,
  value,
  currency,
  error,
  on_change,
}: {
  label: string;
  value: string;
  currency: string;
  error?: string;
  on_change: (value: string) => void;
}) {
  return (
    <div className="w-full min-w-0">
      <p className={OVERLINE_CLASSES}>{label}</p>
      <label className="mt-0.5 flex cursor-text items-baseline gap-1 rounded-lg px-1 py-0.5 transition-colors focus-within:bg-white/[0.03]">
        <span className="text-[10px] text-muted/70">{currency}</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0"
          aria-label={label}
          value={value}
          onChange={(event) => on_change(event.target.value)}
          className="w-full border-b border-transparent bg-transparent pb-0.5 text-right text-xs font-semibold tabular-nums text-zinc-100 placeholder:text-muted/40 transition-colors focus:border-(--alloc-accent)/50 focus:outline-none"
        />
      </label>
      {error ? <p className="px-1 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}

/** Presentational dynamic source rows. Fully controlled by the parent form
 *  (values + callbacks) so income/loan forms can reuse it unchanged. */
export function AllocationsList(props: AllocationsListProps) {
  const {
    label,
    helper_text,
    add_label,
    total_label,
    rows,
    accounts,
    currency,
    accent_color,
    account_placeholder = "Select account",
    total,
    on_add,
    on_remove,
    on_account_click,
    on_amount_change,
    on_charge_change,
    charge_effect = "add",
    combined_label = "Total",
    root_error,
    row_error,
  } = props;

  const charge_total = rows.reduce((sum, row) => {
    const charge = Number(row.charge);
    return Number.isFinite(charge) ? sum + charge : sum;
  }, 0);
  const has_charges = charge_total > 0;
  const combined =
    charge_effect === "subtract" ? total - charge_total : total + charge_total;

  return (
    <section
      className="space-y-2"
      style={{ "--alloc-accent": accent_color ?? DEFAULT_ACCENT } as CSSProperties}
    >
      {label || helper_text ? (
        <div className="px-1">
          {label ? <p className={OVERLINE_CLASSES}>{label}</p> : null}
          {helper_text ? (
            <p className="mt-0.5 text-[11px] text-muted/60">{helper_text}</p>
          ) : null}
        </div>
      ) : null}

      <div className={CARD_CLASSES}>
        {root_error ? (
          <p className="border-b border-white/5 bg-red-500/5 px-4 py-2 text-[11px] text-red-400">
            {root_error}
          </p>
        ) : null}

        <div className="divide-y divide-white/5">
          {rows.map((row: AllocationRowData, index: number) => {
            const account = account_for(accounts, row.account_id);
            const account_error = row_error?.(index, "account_id");
            const amount_error = row_error?.(index, "amount");
            const charge_error = row_error?.(index, "charge");

            return (
              <div key={row.key} className="px-4 py-3">
                {/* Account picker owns the full line, so long names keep their
                    room even after the remove button appears on later rows. */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => on_account_click(index)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center rounded-lg py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--alloc-accent)/30"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs ${
                          account
                            ? "font-medium text-zinc-100"
                            : "text-muted/60"
                        }`}
                      >
                        {account ? account.name : account_placeholder}
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

                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => on_remove(index)}
                      aria-label="Remove account"
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted/50 transition-colors hover:bg-white/[0.03] hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--alloc-accent)/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                {account_error ? (
                  <p className="mt-0.5 pl-1 text-[11px] text-red-400">
                    {account_error}
                  </p>
                ) : null}

                {/* Amount (fills) + hairline + Charge (narrow): the pair reads
                    as one unit, a quiet divider separates the columns, and
                    every row's digits right-align on the same two columns. */}
                <div className="mt-2.5 flex items-stretch gap-3">
                  <div className="min-w-0 flex-1">
                    <MoneyCell
                      label="Amount"
                      currency={currency}
                      value={row.amount}
                      error={amount_error}
                      on_change={(value) => on_amount_change(index, value)}
                    />
                  </div>
                  <div
                    aria-hidden
                    className="w-px shrink-0 self-stretch bg-white/5"
                  />
                  <div className="w-24 shrink-0">
                    <MoneyCell
                      label="Charge"
                      currency={currency}
                      value={row.charge}
                      error={charge_error}
                      on_change={(value) => on_charge_change(index, value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 px-4 py-2.5">
          <button
            type="button"
            onClick={on_add}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-transparent px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <Plus className="h-3.5 w-3.5" />
            {add_label}
          </button>
          <div className="text-right">
            <p className={`${OVERLINE_CLASSES}`}>{total_label}</p>
            <p className="text-[12px] font-semibold tabular-nums leading-tight text-zinc-100">
              {currency}
              {FormatUtils.formatMoney(total)}
            </p>
            {has_charges ? (
              <>
                <p className="mt-1 text-[10px] leading-tight text-muted/60">
                  Charges {currency}
                  {FormatUtils.formatMoney(charge_total)}
                </p>
                <p className="text-[11px] font-semibold leading-tight tabular-nums text-muted">
                  {combined_label} {currency}
                  {FormatUtils.formatMoney(combined)}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
