import Format from "@/lib/Format";

export function TotalSummary({ total, currency_symbol }: { total: number; currency_symbol: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted">Total</span>
      <span className="text-sm font-bold tabular-nums text-foreground">
        {Format.money(total, currency_symbol).full}
      </span>
    </div>
  );
}