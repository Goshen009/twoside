import { Plus, Trash2 } from "lucide-react";
import { FormatUtils } from "@/lib/FormatUtils";
import type {
  AllocationRowData,
  AllocationsListProps,
  InfoAccount,
} from "@/types/types";

function account_label(
  account_id: string,
  accounts: InfoAccount[],
  currency: string,
): string {
  const account = accounts.find((a) => a.id === account_id);
  if (!account) return "Select account";
  return `${account.name} (${currency}${FormatUtils.formatMoney(account.balance)})`;
}

/** Presentational dynamic source rows. Fully controlled by the parent form
 *  (values + callbacks) so income/loan forms can reuse it unchanged. */
export function AllocationsList(props: AllocationsListProps) {
  const {
    label,
    add_label,
    total_label,
    rows,
    accounts,
    currency,
    total,
    on_add,
    on_remove,
    on_account_click,
    on_amount_change,
    root_error,
    row_error,
  } = props;

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
        {label}
      </p>

      {root_error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[10px] text-red-400">
          {root_error}
        </p>
      ) : null}

      <div className="space-y-2">
        {rows.map((row: AllocationRowData, index: number) => {
          const account_error = row_error?.(index, "account_id");
          const amount_error = row_error?.(index, "amount");

          return (
            <div
              key={row.key}
              className="space-y-2 rounded-2xl border border-white/5 bg-black/20 p-2.5"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => on_account_click(index)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-left transition-colors hover:border-white/20"
                >
                  <span
                    className={`block truncate text-xs ${
                      row.account_id ? "text-zinc-100" : "text-muted"
                    }`}
                  >
                    {account_label(row.account_id, accounts, currency)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => on_remove(index)}
                  disabled={rows.length <= 1}
                  aria-label="Remove account"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-muted transition-colors hover:border-red-500/30 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {account_error ? (
                <p className="text-[10px] text-red-400">{account_error}</p>
              ) : null}

              <div className="space-y-1.5">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted">
                    {currency}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={(event) => on_amount_change(index, event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-8 pr-3.5 font-mono text-xs text-zinc-100 placeholder:text-muted/50 transition-colors focus:border-primary/50 focus:outline-none"
                  />
                </div>
                {amount_error ? (
                  <p className="text-[10px] text-red-400">{amount_error}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={on_add}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
        >
          <Plus className="h-3.5 w-3.5" />
          {add_label}
        </button>
        <div className="text-right">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
            {total_label}
          </p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {currency}
            {FormatUtils.formatMoney(total)}
          </p>
        </div>
      </div>
    </div>
  );
}
