import type { CSSProperties } from "react";
import { DateTime } from "luxon";
import { Check } from "lucide-react";
import { Sheet } from "../Sheet";
import Format from "@/lib/Format";
import Money from "@/lib/Money";

export interface PickableLoan {
  id: string;
  counterparty_name: string;
  date_issued: string; // UTC ISO
  amount: number;
  total_repaid: number;
}

interface LoanPickerSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  loans: PickableLoan[];
  selected_id: string | null;
  onSelect: (id: string) => void;
  currency_symbol: string;
  timezone: string;
  accent: string;
  empty_message?: string;
}

export function LoanPickerSheet({ open, onClose, title, loans, selected_id, onSelect, currency_symbol, timezone, accent, empty_message = "No open loans" }: LoanPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="space-y-2" style={{ "--form-accent": accent } as CSSProperties}>
        {loans.length === 0 && <p className="py-4 text-center text-xs text-muted">{empty_message}</p>}

        {loans.map((loan) => {
          const on = loan.id === selected_id;
          const remaining = Money.sum([loan.amount, -loan.total_repaid]);
          return (
            <button
              type="button"
              key={loan.id}
              onClick={() => {
                onSelect(loan.id);
                onClose();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                on ? "border-(--form-accent)/40 bg-(--form-accent)/10" : "border-border bg-surface hover:bg-surface-hover"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">{loan.counterparty_name}</span>
                <span className="mt-0.5 block text-2xs text-muted">
                  {DateTime.fromISO(loan.date_issued, { zone: "utc" }).setZone(timezone).toFormat("MMM d, yyyy")}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2.5">
                <span className="text-right">
                  <span className="block text-[13px] font-bold tabular-nums text-(--form-accent)">
                    {Format.money(remaining, currency_symbol).full}
                  </span>
                  <span className="block text-2xs tabular-nums text-muted">
                    of {Format.money(loan.amount, currency_symbol).full}
                  </span>
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    on ? "border-transparent bg-(--form-accent)" : "border-border"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}