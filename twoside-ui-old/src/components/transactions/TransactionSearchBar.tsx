import { Search, SlidersHorizontal } from "lucide-react";

type TransactionSearchBarProps = {
  search_query: string;
  on_search_change: (value: string) => void;
  is_filter_open: boolean;
  has_active_filters: boolean;
  on_toggle_filters: () => void;
};

export default function TransactionSearchBar({
  search_query,
  on_search_change,
  is_filter_open,
  has_active_filters,
  on_toggle_filters,
}: TransactionSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Search recent activity..."
          value={search_query}
          onChange={(e) => on_search_change(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
        />
      </div>
      <button
        onClick={on_toggle_filters}
        className={`relative p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs shrink-0 ${
          is_filter_open || has_active_filters
            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
            : "bg-surface/80 border-white/5 text-muted hover:text-zinc-100"
        }`}
        title="Toggle Filters & Summary"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="hidden sm:inline font-medium">Filters</span>
        {has_active_filters && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
        )}
      </button>
    </div>
  );
}