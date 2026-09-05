import { ChevronRight } from "lucide-react";
import { FormatUtils } from "@/lib/FormatUtils";
import type { LoanFieldProps } from "@/types/types";

/**
 * Card row that opens the loan picker. Once a loan is chosen it shows the
 * counterparty name plus the outstanding balance (tinted with the form accent);
 * before that it reads as a muted prompt.
 */
export function LoanField(props: LoanFieldProps) {
  const { icon: Icon, loan, currency, placeholder, error, on_click } = props;
  const outstanding = loan ? loan.amount - loan.total_repaid : 0;

  return (
    <div>
      <button
        type="button"
        onClick={on_click}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.02] active:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--form-accent)/30"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-xs ${
              loan ? "font-medium text-zinc-100" : "text-muted/60"
            }`}
          >
            {loan ? loan.counterparty_name : placeholder}
          </span>
          {loan ? (
            <span className="block truncate text-[10px] font-medium tabular-nums text-(--form-accent)">
              {currency}
              {FormatUtils.formatMoney(outstanding)} outstanding
            </span>
          ) : null}
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/40" />
      </button>
      {error ? (
        <p className="px-4 pb-2.5 text-[11px] text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
