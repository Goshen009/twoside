import { Plus, Trash2 } from "lucide-react";
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
    total,
    on_add,
    on_remove,
    on_account_click,
    on_amount_change,
    root_error,
    row_error,
  } = props;

  return (
    <section
      className="space-y-2"
      style={{ "--alloc-accent": accent_color ?? DEFAULT_ACCENT } as CSSProperties}
    >
      <div className="px-1">
        <p className={OVERLINE_CLASSES}>{label}</p>
        {helper_text ? (
          <p className="mt-0.5 text-[11px] text-muted/60">{helper_text}</p>
        ) : null}
      </div>

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
            const row_message = account_error ?? amount_error;

            return (
              <div key={row.key} className="px-4 py-2">
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
                        {account ? account.name : "Select account"}
                      </span>
                      {account ? (
                        <span className="block truncate text-[10px] text-muted/60">
                          Balance {currency}
                          {FormatUtils.formatMoney(account.balance)}
                        </span>
                      ) : null}
                    </span>
                  </button>

                  <label className="flex shrink-0 items-baseline gap-1 rounded-lg px-1 py-1 transition-colors focus-within:bg-white/[0.03]">
                    <span className="text-[10px] text-muted/70">
                      {currency}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      aria-label="Amount"
                      value={row.amount}
                      onChange={(event) =>
                        on_amount_change(index, event.target.value)
                      }
                      className="w-20 border-b border-transparent bg-transparent pb-0.5 text-right text-xs font-semibold tabular-nums text-zinc-100 placeholder:text-muted/40 transition-colors focus:border-(--alloc-accent)/50 focus:outline-none"
                    />
                  </label>

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

                {row_message ? (
                  <p className="mt-0.5 pl-1 text-[11px] text-red-400">
                    {row_message}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 px-4 py-2.5">
          <button
            type="button"
            onClick={on_add}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-(--alloc-accent) transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--alloc-accent)/30"
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
          </div>
        </div>
      </div>
    </section>
  );
}
