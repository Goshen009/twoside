import type { TransactionEntry } from "@/types/types";
import Constants from "@/lib/Constants";

interface TransactionRowProps {
  entry: TransactionEntry;
  currency_symbol: string;
}

function formatAmount(amount: number, currency_symbol: string): string {
  const [whole, decimal] = amount.toFixed(2).split(".");
  const with_separators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency_symbol}${with_separators}.${decimal}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TransactionRow({ entry, currency_symbol }: TransactionRowProps) {
  const meta = Constants.TRANSACTION_TYPE_META[entry.log_type];
  const Icon = meta.icon;
  const is_inflow = entry.side === "DEBIT"; // asset account: debit = money in

  return (
	  <div className="py-3 flex items-center justify-between gap-3">
	    <div className="flex items-center gap-2 min-w-0">
	      <div className={`w-11 h-11 rounded-2xl ${meta.bg} ${meta.text} flex items-center justify-center shrink-0`}>
	        <Icon className="w-5 h-5" />
	      </div>
	      <div className="min-w-0">
	        <p className="text-[12px] font-medium text-foreground leading-tight line-clamp-2">
	          {entry.description}
	        </p>
	        <p className="text-2xs text-muted leading-normal mt-1">
	          {meta.label} • {formatTime(entry.transaction_date)}
	        </p>
	      </div>
	    </div>
	    <span className={`text-[13px] font-semibold tabular-nums shrink-0 ${is_inflow ? "text-income" : "text-expense"}`}>
	      {is_inflow ? "+" : "-"}
	      {formatAmount(entry.amount, currency_symbol)}
	    </span>
	  </div>
  );
}