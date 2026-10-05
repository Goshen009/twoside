import { Eye, EyeOff } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { Money } from "@/lib/money";

interface TodayCardProps {
  total: string;
  currency_symbol: string;
  daily_limit?: number | null;
  is_loading?: boolean;
}

export function TodayCard({ total, currency_symbol, daily_limit = null, is_loading = false }: TodayCardProps) {
  const is_hidden = useUIStore((s) => s.is_amounts_hidden);
  const toggleAmountsHidden = useUIStore((s) => s.toggleAmountsHidden);

  const { whole, decimal } = Money.splitAmount(total);
  const over = !is_loading && daily_limit !== null && Money.exceedsLimit(total, daily_limit);

  return (
    <section
      aria-label="Spent today"
      className="bg-surface rounded-3xl p-5 border border-border shadow-lg relative overflow-hidden"
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          over ? "bg-expense/10" : "bg-primary/10"
        }`}
      />

      <div className="flex justify-end mb-1">
        <button
          type="button"
          aria-label="Toggle amount visibility"
          onClick={toggleAmountsHidden}
          className="text-muted hover:text-foreground p-1 rounded-full hover:bg-white/5 transition-colors"
        >
          {is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="text-center pb-2 overflow-hidden">
        <p className="text-sm text-foreground/80 font-medium tracking-wide mb-1.5">Spent today</p>
        {is_loading ? (
          <div className="h-9 w-40 rounded-lg bg-surface-hover animate-pulse mx-auto" />
        ) : (
          <div className="flex items-center justify-center">
            <span
              className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                over ? "text-expense" : "text-foreground"
              }`}
            >
              {is_hidden ? (
                "••••••"
              ) : (
                <>
                  {currency_symbol}
                  {whole}
                  <span className="opacity-60">.{decimal}</span>
                </>
              )}
            </span>
          </div>
        )}
        {over && <p className="mt-2 text-2xs font-semibold text-expense">Over your daily limit</p>}
      </div>
    </section>
  );
}