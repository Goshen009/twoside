import { X } from "lucide-react";
import Format from "../../libs/format";
import { type Loan } from "../../hooks/useLoans";

type LoanPickerSheetProps = {
  is_open: boolean;
  title: string;
  loans: Loan[];
  selected_loan_id?: string | null;
  amount_color: string;
  on_select: (loan_id: string) => void;
  on_close: () => void;
};

const STATUS_LABEL: Record<Loan["status"], string> = {
  OPEN: "Open",
  PARTIALLY_REPAID: "Partially repaid",
  CLOSED: "Closed",
};

export default function LoanPickerSheet({
  is_open, title, loans, selected_loan_id, amount_color, on_select, on_close,
}: LoanPickerSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        is_open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0" onClick={on_close} />
      <div
        className={`relative w-full max-w-md bg-surface border-t border-x border-white/10 rounded-t-3xl p-5 space-y-4 shadow-2xl transition-all duration-300 ease-out transform ${
          is_open ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-98"
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <button onClick={on_close} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {loans.length === 0 && (
            <div className="text-center py-8 text-xs text-muted">No open loans found.</div>
          )}
          {loans.map((loan) => {
            const is_selected = loan.id === selected_loan_id;
            const outstanding = loan.amount - loan.total_repaid;
            return (
              <button
                key={loan.id}
                onClick={() => { on_select(loan.id); on_close(); }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                  is_selected ? "bg-primary/10 border-primary/40" : "bg-black/20 border-white/5 hover:bg-white/5"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-zinc-200 truncate">{loan.counterparty_name}</div>
                  <div className="text-[10px] text-muted">
                    {Format.formatDate(loan.date_issued)} • {STATUS_LABEL[loan.status]}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xs font-mono font-bold ${amount_color}`}>₦{Format.formatMoney(outstanding)}</div>
                  <div className="text-[10px] text-muted/70">of ₦{Format.formatMoney(loan.amount)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}