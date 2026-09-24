import { LOG_TYPE_TO_TRANSACTION_TYPE, TRANSACTION_TYPE_META } from "@/constants/transactions";
import { FormatUtils } from "@/lib/FormatUtils";
import type { TransactionEntry, TransactionRowProps } from "@/types/types";

/** On an asset account, DEBIT = money in, CREDIT = money out. */
function isMoneyIn(entry: TransactionEntry): boolean {
  return entry.side === "DEBIT";
}

export function TransactionRow({
  entry,
  show_account_name,
  currency_symbol,
  time_zone,
  on_click,
}: TransactionRowProps) {
  const meta = TRANSACTION_TYPE_META[LOG_TYPE_TO_TRANSACTION_TYPE[entry.log_type]];
  const Icon = meta.icon;
  const money_in = isMoneyIn(entry);
  const amount_class = money_in ? "text-emerald-400" : "text-rose-400";
  const sign = money_in ? "+" : "-";

  return (
    <button
      type="button"
      onClick={() => on_click(entry)}
      className="w-full cursor-pointer rounded-2xl border border-white/5 bg-surface/80 px-3 py-3 text-left transition-colors hover:bg-surface-hover active:bg-surface-hover"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5"
            style={{ backgroundColor: `${meta.accent}1f`, color: meta.accent }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-xs font-medium text-zinc-100">
              {entry.description || meta.label}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted">
              <span className="shrink-0">
                {FormatUtils.formatDate(entry.transaction_date, time_zone)}
              </span>
              {show_account_name ? (
                <>
                  <span className="text-white/10">•</span>
                  <span className="truncate">{entry.account_name}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span className={`font-mono text-[10px] font-semibold ${amount_class}`}>
            {sign}
            {currency_symbol}
            {FormatUtils.formatMoney(entry.amount)}
          </span>
        </div>
      </div>
    </button>
  );
}