import { useMemo, useState } from "react";
import FilterDrawer from "@/components/transactions/FilterDrawer";
import TransactionSearchBar from "@/components/transactions/TransactionSearchBar";
import CategoryPickerSheet from "@/components/transactions/CategoryPickerSheet";
import SummaryStrip from "@/components/transactions/SummaryStrip";
import TransactionList from "@/components/transactions/TransactionList";
import { useAccountSummary } from "@/hooks/useAccountSummary";
import { useAccountTransactions } from "@/hooks/useAccountTransactions";
import { useCategories } from "@/hooks/useCategories";
import Format from "@/lib/format";

type TransactionsFeedProps = {
  selected_account_id: string;
};

function getPresetRange(preset: "today" | "week" | "month" | "all") {
  const today = new Date();
  const to_str = today.toISOString().slice(0, 10);
  if (preset === "today") return { from: to_str, to: to_str };
  if (preset === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return { from: start.toISOString().slice(0, 10), to: to_str };
  }
  if (preset === "month") {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
  }
  return { from: "", to: "" };
}

export default function TransactionsFeed({ selected_account_id }: TransactionsFeedProps) {
  const { categories } = useCategories();

  const [search_query, set_search_query] = useState("");
  const [is_filter_open, set_is_filter_open] = useState(false);
  const [is_category_modal_open, set_is_category_modal_open] = useState(false);

  const [staged_from_date, set_staged_from_date] = useState("");
  const [staged_to_date, set_staged_to_date] = useState("");
  const [staged_category_id, set_staged_category_id] = useState<string | null>(null);
  const [active_preset, set_active_preset] = useState<"today" | "week" | "month" | "all" | null>(null);

  const [applied_from_date, set_applied_from_date] = useState("");
  const [applied_to_date, set_applied_to_date] = useState("");
  const [applied_category_id, set_applied_category_id] = useState<string | null>(null);

  const has_active_filters = !!(applied_from_date || applied_to_date || applied_category_id);

  function handlePresetSelect(preset: "today" | "week" | "month" | "all") {
    set_active_preset(preset);
    const range = getPresetRange(preset);
    set_staged_from_date(range.from);
    set_staged_to_date(range.to);
  }

  function handleApplyFilters() {
    set_applied_from_date(staged_from_date);
    set_applied_to_date(staged_to_date);
    set_applied_category_id(staged_category_id);
    set_is_filter_open(false);
  }

  function handleResetFilters() {
    set_staged_from_date("");
    set_staged_to_date("");
    set_staged_category_id(null);
    set_active_preset(null);
    set_applied_from_date("");
    set_applied_to_date("");
    set_applied_category_id(null);
  }

  function openFilters() {
    set_staged_from_date(applied_from_date);
    set_staged_to_date(applied_to_date);
    set_staged_category_id(applied_category_id);
    set_is_filter_open((prev) => !prev);
  }

  const staged_category_name = staged_category_id
    ? categories.find((c) => c.id === staged_category_id)?.name ?? "All Categories"
    : "All Categories";

  const is_all = selected_account_id === "all";
  
  const { summary, loading: summary_loading } = useAccountSummary(
    selected_account_id,
    applied_from_date,
    applied_to_date
  );
  
  const { entries, has_next, loading, loading_more, loadMore } = useAccountTransactions(
    selected_account_id,
    applied_category_id,
    applied_from_date,
    applied_to_date
  );

  const filtered_entries = useMemo(() => {
    if (!search_query.trim()) return entries;
    const q = search_query.toLowerCase();
    return entries.filter((e) => e.description.toLowerCase().includes(q));
  }, [entries, search_query]);

  const summary_label =
    applied_from_date || applied_to_date
      ? `Summary from ${applied_from_date ? Format.formatDate(applied_from_date) : "No Date"} to ${
      	applied_to_date ? Format.formatDate(applied_to_date) : "No Date"
      }`
      : "All-Time Financial Summary";

  return (
    <div className="space-y-3 relative">
      <TransactionSearchBar
        search_query={search_query}
        on_search_change={set_search_query}
        is_filter_open={is_filter_open}
        has_active_filters={has_active_filters}
        on_toggle_filters={openFilters}
      />

      <FilterDrawer
        is_open={is_filter_open}
        staged_from_date={staged_from_date}
        staged_to_date={staged_to_date}
        active_preset={active_preset}
        staged_category_name={staged_category_name}
        on_preset_select={handlePresetSelect}
        on_from_date_change={(v) => {
          set_staged_from_date(v);
          set_active_preset(null);
        }}
        on_to_date_change={(v) => {
          set_staged_to_date(v);
          set_active_preset(null);
        }}
        on_open_category_picker={() => set_is_category_modal_open(true)}
        on_reset={handleResetFilters}
        on_apply={handleApplyFilters}
      />

      <CategoryPickerSheet
        is_open={is_category_modal_open}
        categories={categories}
        staged_category_id={staged_category_id}
        on_select={(id) => {
          set_staged_category_id(id);
          set_is_category_modal_open(false);
        }}
        on_close={() => set_is_category_modal_open(false)}
      />

      <SummaryStrip summary={summary} loading={summary_loading} label={summary_label} />

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-sans text-muted uppercase tracking-wider block">
            Transaction Activity
          </span>
        </div>
        <TransactionList
          entries={filtered_entries}
          loading={loading}
          has_next={has_next}
          loading_more={loading_more}
          show_account_name={is_all}
          on_load_more={loadMore}
        />
      </div>
    </div>
  );
}