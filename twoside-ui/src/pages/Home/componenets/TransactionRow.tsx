import type { TransactionEntry } from "@/types/types";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";

import Constants from "@/lib/Constants";
import Format from "@/lib/Format";

interface TransactionRowProps {
  entry: TransactionEntry;
  currency_symbol: string;
}

export function TransactionRow({ entry, currency_symbol }: TransactionRowProps) {
	const iana_timezone = useUserStore((state) => state.data?.iana_timezone);
	const is_hidden = useUIStore((state) => state.is_amounts_hidden);
	
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
	          {Format.time(entry.transaction_date, iana_timezone ?? "Africa/Lagos").time} • { meta.label }
	        </p>
	      </div>
	    </div>
	    <span
			  className={`text-[13px] font-semibold tabular-nums shrink-0 ${
			    is_hidden ? "text-white" : is_inflow ? "text-income" : "text-expense"
			  }`}
			>
				{is_hidden ? (
					<span className="text-muted">—</span>
				) : (
					<>{is_inflow ? "+" : "-"}{Format.money(entry.amount, currency_symbol).full}</>
				)}		
	    </span>
	  </div>
  );
}