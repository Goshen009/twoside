import type { AccountSummary } from "@/lib/types";
import Format from "@/lib/format";

type SummaryStripProps = {
  summary: AccountSummary | null;
  loading: boolean;
  label: string;
};

export default function SummaryStrip({ summary, loading, label }: SummaryStripProps) {
  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-sans text-muted uppercase tracking-wider block">{label}</span>
      </div>
      {loading || !summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-black/30 p-2.5 rounded-xl border border-white/5 animate-pulse h-12" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Opening Balance</span>
            <span className="text-xs font-mono font-bold text-zinc-200">₦{Format.formatMoney(summary.opening_balance)}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Money In</span>
            <span className="text-xs font-mono font-bold text-emerald-400">+₦{Format.formatMoney(summary.total_in)}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Money Out</span>
            <span className="text-xs font-mono font-bold text-rose-400">-₦{Format.formatMoney(summary.total_out)}</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-muted block font-mono">Closing Balance</span>
            <span className="text-xs font-mono font-bold text-sky-400">₦{Format.formatMoney(summary.closing_balance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}