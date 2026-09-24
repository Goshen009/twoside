import { Sheet } from "@/components/ui/Sheet";
import { LOG_TYPE_TO_TRANSACTION_TYPE, TRANSACTION_TYPE_META } from "@/constants/transactions";
import { FormatUtils } from "@/lib/FormatUtils";
import type {
  TransactionDetailSheetProps,
  TransactionEntry,
} from "@/types/types";

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="min-w-0 truncate text-right text-[11px] font-medium text-zinc-200">
        {value}
      </dd>
    </div>
  );
}

/** On an asset account, DEBIT = money in, CREDIT = money out. */
function isMoneyIn(entry: TransactionEntry): boolean {
  return entry.side === "DEBIT";
}

/** Headline figure for the sheet. Money-in is stored net of its fee, so the
 *  fee is added back to show the gross that was received; money-out is stored
 *  fee-inclusive already (amount + charge), so its amount is the total. */
function headlineAmount(entry: TransactionEntry): number {
  return isMoneyIn(entry)
    ? entry.amount + (entry.charge_amount ?? 0)
    : entry.amount;
}

export function TransactionDetailSheet({
  entry,
  currency_symbol,
  time_zone,
  on_close,
}: TransactionDetailSheetProps) {
  const meta = entry
    ? TRANSACTION_TYPE_META[LOG_TYPE_TO_TRANSACTION_TYPE[entry.log_type]]
    : null;
  const open = entry !== null;

  return (
    <Sheet
      open={open}
      on_close={on_close}
      title={meta?.label ?? "Transaction"}
    >
      {entry && meta ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5"
              style={{ backgroundColor: `${meta.accent}1f`, color: meta.accent }}
            >
              <meta.icon className="h-5 w-5" />
            </span>
            <p
              className={`font-mono text-2xl font-extrabold tracking-tight ${
                isMoneyIn(entry) ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isMoneyIn(entry) ? "+" : "-"}
              {currency_symbol}
              {FormatUtils.formatMoney(headlineAmount(entry))}
            </p>
            {entry.description ? (
              <p className="max-w-full px-2 text-xs text-zinc-300">
                {entry.description}
              </p>
            ) : null}
          </div>

          <dl className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-black/20">
            <DetailRow
              label="Date"
              value={FormatUtils.formatDateTime(
                entry.transaction_date,
                time_zone,
              )}
            />
            <DetailRow label="Account" value={entry.account_name} />
            {entry.related_account ? (
              <DetailRow label="Other account" value={entry.related_account.name} />
            ) : null}
            {entry.related_counterparty ? (
              <DetailRow
                label="Counterparty"
                value={entry.related_counterparty.name}
              />
            ) : null}
            {entry.category_name ? (
              <DetailRow label="Category" value={entry.category_name} />
            ) : null}
            {entry.charge_amount ? (
              <DetailRow
                label="Fee"
                value={`${currency_symbol}${FormatUtils.formatMoney(
                  entry.charge_amount,
                )}`}
              />
            ) : null}
          </dl>
        </div>
      ) : null}
    </Sheet>
  );
}