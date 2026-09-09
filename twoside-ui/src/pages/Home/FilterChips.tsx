import { Calendar, Tag, X } from "lucide-react";
import type { FilterChipsProps } from "@/types/types";

function chip_class(active: boolean): string {
  return `flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-white/5 bg-surface/80 text-zinc-300 hover:text-zinc-100"
  }`;
}

export function FilterChips({
  category_label,
  has_category,
  range_label,
  has_date_range,
  on_open_category,
  on_open_date_range,
  on_clear,
}: FilterChipsProps) {
  const has_active_filter = has_category || has_date_range;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={on_open_category}
        className={chip_class(has_category)}
      >
        <Tag className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{category_label}</span>
      </button>

      <button
        type="button"
        onClick={on_open_date_range}
        className={chip_class(has_date_range)}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{range_label}</span>
      </button>

      {has_active_filter ? (
        <button
          type="button"
          onClick={on_clear}
          aria-label="Clear category and date filters"
          className="ml-auto flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-zinc-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}