import type { CSSProperties } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { FormatUtils } from "@/lib/FormatUtils";
import type { LoanPickerSheetProps } from "@/types/types";

function format_date_issued(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Rich single-select picker for open loans. Each row shows the counterparty,
 * the issued date, and the outstanding balance (in the form's accent) next to
 * the original amount — the detail you need to pick which loan to repay.
 */
export function LoanPickerSheet(props: LoanPickerSheetProps) {
  const {
    open,
    title,
    loans,
    currency,
    accent_color,
    selected_id,
    on_select,
    on_close,
    empty_message = "No open loans found",
  } = props;

  function choose(loan_id: string): void {
    on_select(loan_id);
    on_close();
  }

  return (
    <Sheet open={open} on_close={on_close} title={title}>
      <div
        className="flex flex-col gap-2"
        style={{ "--form-accent": accent_color } as CSSProperties}
      >
        {loans.length === 0 ? (
          <p className="px-1 py-3 text-center text-xs text-muted">
            {empty_message}
          </p>
        ) : (
          <div className="space-y-1.5">
            {loans.map((loan) => {
              const is_selected = loan.id === selected_id;
              const outstanding = loan.amount - loan.total_repaid;
              return (
                <button
                  type="button"
                  key={loan.id}
                  onClick={() => choose(loan.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    is_selected
                      ? "border-(--form-accent)/40 bg-(--form-accent)/10"
                      : "border-white/5 bg-black/20 hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0 flex-1 pr-2">
                    <span className="block truncate text-xs font-medium text-zinc-200">
                      {loan.counterparty_name}
                    </span>
                    <span className="block truncate text-[10px] text-muted">
                      {format_date_issued(loan.date_issued)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className="block font-mono text-xs font-bold tabular-nums"
                      style={{ color: accent_color }}
                    >
                      {currency}
                      {FormatUtils.formatMoney(outstanding)}
                    </span>
                    <span className="block text-[10px] text-muted/70">
                      of {currency}
                      {FormatUtils.formatMoney(loan.amount)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Sheet>
  );
}
