import type { JournalEntry } from "@/lib/types";
import TransactionRow from "./TransactionRow";

type TransactionListProps = {
  entries: JournalEntry[];
  loading: boolean;
  has_next: boolean;
  loading_more: boolean;
  show_account_name: boolean;
  on_load_more: () => void;
};

export default function TransactionList({
  entries,
  loading,
  has_next,
  loading_more,
  on_load_more,
  show_account_name
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-surface/60 border border-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-xs text-muted bg-surface/40 border border-white/5 rounded-2xl">
        No transactions found matching these filters.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <TransactionRow key={entry.entry_id} entry={entry} show_account_name={show_account_name} />
      ))}
      {has_next && (
        <button
          onClick={on_load_more}
          disabled={loading_more}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-zinc-300 transition-all disabled:opacity-50"
        >
          {loading_more ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}