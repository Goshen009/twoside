import { useMemo, useState } from "react";
import { AlertCircle, Receipt } from "lucide-react";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { useInfo } from "@/hooks/useInfo";
import { useTransactions } from "@/hooks/useTransactions";
import { FormatUtils } from "@/lib/FormatUtils";
import type { TransactionEntry } from "@/types/types";
import { DateRangeSheet } from "./DateRangeSheet";
import { FilterChips } from "./FilterChips";
import { TransactionDetailSheet } from "./TransactionDetailSheet";
import { TransactionRow } from "./TransactionRow";

function buildRangeLabel(
  start_date: string | null,
  end_date: string | null,
  time_zone: string,
): string {
  if (start_date && end_date) {
    if (start_date === end_date) {
      return FormatUtils.formatDate(start_date, time_zone);
    }
    return `${FormatUtils.formatDate(start_date, time_zone)} – ${FormatUtils.formatDate(end_date, time_zone)}`;
  }
  if (start_date) return `From ${FormatUtils.formatDate(start_date, time_zone)}`;
  if (end_date) return `Until ${FormatUtils.formatDate(end_date, time_zone)}`;
  return "All time";
}

export function TransactionsFeed() {
  const { data: info } = useInfo();
  const transactions = useTransactions();

  const categories = useMemo(() => info?.categories ?? [], [info]);
  const currency_symbol = info?.currency_symbol ?? "₦";
  const time_zone = info?.iana_timezone ?? "";

  const [is_category_sheet_open, setIsCategorySheetOpen] = useState(false);
  const [is_date_sheet_open, setIsDateSheetOpen] = useState(false);
  const [selected_entry, setSelectedEntry] = useState<TransactionEntry | null>(
    null,
  );

  const {
    entries,
    loading,
    is_refreshing,
    loading_more,
    has_next,
    error,
    filters,
    set_filters,
    load_more,
    refetch,
  } = transactions;

  const active_category = useMemo(
    () => categories.find((category) => category.id === filters.category_id) ?? null,
    [categories, filters.category_id],
  );

  const has_date_range = filters.start_date !== null || filters.end_date !== null;
  const range_label = buildRangeLabel(
    filters.start_date,
    filters.end_date,
    time_zone,
  );
  const show_account_name = filters.account_id === null;

  function handleCategorySelect(category_id: string): void {
    set_filters({ category_id });
  }

  function handleCategoryClear(): void {
    set_filters({ category_id: null });
  }

  function handleDateChange(
    start_date: string | null,
    end_date: string | null,
  ): void {
    set_filters({ start_date, end_date });
  }

  function handleClearFilters(): void {
    set_filters({ category_id: null, start_date: null, end_date: null });
  }

  function empty_title(): string {
    if (filters.category_id || has_date_range) {
      return "No transactions match these filters.";
    }
    if (filters.account_id) {
      return "No transactions in this account yet.";
    }
    return "No transactions yet.";
  }

  return (
    <div className="space-y-3">
      <FilterChips
        category_label={active_category?.name ?? "Category"}
        has_category={filters.category_id !== null}
        range_label={range_label}
        has_date_range={has_date_range}
        on_open_category={() => setIsCategorySheetOpen(true)}
        on_open_date_range={() => setIsDateSheetOpen(true)}
        on_clear={handleClearFilters}
      />

      {error && entries.length > 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
          <p className="min-w-0 truncate text-[11px] text-red-400">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 text-[11px] font-semibold text-red-400 hover:text-red-300"
          >
            Retry
          </button>
        </div>
      ) : null}

      {error && entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-8 text-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-xs text-red-300">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-2xl border border-white/5 bg-surface/60"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-surface/40 px-4 py-10 text-center">
          <Receipt className="h-5 w-5 text-muted/60" />
          <p className="text-xs text-zinc-300">{empty_title()}</p>
          <p className="text-[10px] text-muted">
            Add one with the + button below.
          </p>
        </div>
      ) : (
        <div className="space-y-2 pt-0.5">
          {is_refreshing ? (
            <p className="px-1 text-[10px] text-muted">Refreshing…</p>
          ) : null}
          {entries.map((entry) => (
            <TransactionRow
              key={entry.entry_id}
              entry={entry}
              show_account_name={show_account_name}
              currency_symbol={currency_symbol}
              time_zone={time_zone}
              on_click={setSelectedEntry}
            />
          ))}

          {has_next ? (
            <button
              type="button"
              onClick={() => load_more()}
              disabled={loading_more}
              className="w-full cursor-pointer rounded-xl border border-white/5 bg-white/5 py-2.5 text-xs font-medium text-zinc-300 transition-all hover:bg-white/10 disabled:cursor-default disabled:opacity-50"
            >
              {loading_more ? "Loading…" : "Load more"}
            </button>
          ) : null}
        </div>
      )}

      <PickerSheet
        open={is_category_sheet_open}
        title="Filter by category"
        items={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        selected_id={filters.category_id}
        on_select={handleCategorySelect}
        on_close={() => setIsCategorySheetOpen(false)}
        show_none={filters.category_id !== null}
        none_label="All categories"
        on_none={handleCategoryClear}
        search_placeholder="Search categories"
        empty_message="No categories"
      />

      <DateRangeSheet
        open={is_date_sheet_open}
        start_date={filters.start_date}
        end_date={filters.end_date}
        on_change={handleDateChange}
        on_close={() => setIsDateSheetOpen(false)}
      />

      <TransactionDetailSheet
        entry={selected_entry}
        currency_symbol={currency_symbol}
        time_zone={time_zone}
        on_close={() => setSelectedEntry(null)}
      />
    </div>
  );
}