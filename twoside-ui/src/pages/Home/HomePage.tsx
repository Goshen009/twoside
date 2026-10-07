import { useEffect, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { useUIStore } from "@/stores/useUIStore";
import { Money } from "@/lib/money";
import { Dates } from "@/lib/dates";
import { HomeHeader } from "./components/HomeHeader";
import { TodayCard } from "./components/TodayCard";
import { TagFilter } from "./components/TagFilter";
import { TransactionGroup } from "./components/TransactionGroup";
import { TransactionSkeletonList } from "./components/TransactionRow";
import { Plus } from "lucide-react";
import { AddTransactionFlow } from "./add/AddTransactionFlow";
import type { Transaction } from "@/types/types";
import { EditTransactionFlow } from "./edit/EditTransactionFlow";
import { SettingsFlow } from "./settings/SettingsFlow";
import { InstallHint } from "./components/InstallHint";

// TODO: wire to localStorage when the daily-limit feature lands.
const DAILY_LIMIT = null as number | null;

export default function HomePage() {
  const info = useUserStore((s) => s.data);
  const user_error = useUserStore((s) => s.error);
  const fetchInfo = useUserStore((s) => s.fetch);

  const days = useTransactionsStore((s) => s.days);
  const tag_id = useTransactionsStore((s) => s.tag_id);
  const is_fetching = useTransactionsStore((s) => s.is_fetching);
  const txn_error = useTransactionsStore((s) => s.error);
  const fetchTransactions = useTransactionsStore((s) => s.fetch);

  const is_hidden = useUIStore((s) => s.is_amounts_hidden);

  // Only explicit user toggles are stored; everything else defaults to open.
  const overrides = useUIStore((s) => s.day_overrides);
  const setOverrides = useUIStore((s) => s.setDayOverrides);
  const [add_open, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [settings_open, setSettingsOpen] = useState(false);
  
  useEffect(() => {
    const user = useUserStore.getState();
    const txns = useTransactionsStore.getState();
  
    if (user.data) user.refetch();
    else user.fetch();
  
    if (txns.days) txns.refetch();
    else txns.fetch(txns.tag_id);
  }, []);
  
  const retry = () => {
    fetchInfo();
    fetchTransactions(tag_id);
  };
  
  const error = user_error ?? txn_error;
  const currency_symbol = info?.currency_symbol ?? "₦";

  const isOpen = (date: string) => overrides[date] ?? true;
  const all_open = !!days?.length && days.every((d) => isOpen(d.date));

  const toggleDay = (date: string) =>
    setOverrides((prev) => ({ ...prev, [date]: !(prev[date] ?? true) }));

  const setAll = (open: boolean) =>
    setOverrides(Object.fromEntries((days ?? []).map((d) => [d.date, open])));

  const active_tag = info?.tags.find((t) => t.id === tag_id);
  const filtered_total = days && tag_id ? Money.sumAmounts(days.map((d) => d.total)) : null;

  return (
    <div className="min-h-screen pb-36">
      <div className="px-5">
      	<HomeHeader onSettingsClick={() => setSettingsOpen(true)} />
      </div>

      <div className="px-5 space-y-5">
        <TodayCard
          total={info?.total_spent_today ?? "0.00"}
          currency_symbol={currency_symbol}
          daily_limit={DAILY_LIMIT}
          is_loading={!info}
        />

        {info && (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-2xs font-semibold text-muted">
              {active_tag && filtered_total !== null && !is_fetching && (
                <>
                  {active_tag.name} total:{" "}
                  <span className="tabular-nums text-foreground">
                    {is_hidden ? "••••" : Money.formatAmount(filtered_total, currency_symbol)}
                  </span>
                </>
              )}
            </p>

            <div className="flex gap-1 shrink-0">
              <TagFilter tags={info.tags} value={tag_id} onChange={(id) => fetchTransactions(id)} />
              {!!days?.length && (
                <button
                  type="button"
                  onClick={() => setAll(!all_open)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-2xs font-semibold text-muted transition-colors"
                >
                  {all_open ? <ChevronsDownUp className="h-3 w-3" /> : <ChevronsUpDown className="h-3 w-3" />}
                  {all_open ? "Collapse all" : "Expand all"}
                </button>
              )}
            </div>
          </div>
        )}

        <section aria-label="Transactions" className="space-y-6">
          {error && !is_fetching ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="text-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !days || !info || is_fetching ? (
            <TransactionSkeletonList />
          ) : days.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              {tag_id ? "Nothing matches this filter." : "No transactions found. Add some"}
            </p>
          ) : (
            days.map((day) => (
              <TransactionGroup
                key={day.date}
                day={day}
                label={Dates.dayLabel(day.date, info.timezone)}
                open={isOpen(day.date)}
                onToggle={() => toggleDay(day.date)}
                currency_symbol={info.currency_symbol}
                timezone={info.timezone}
                onEntryClick={setEditing}
              />
            ))
          )}
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40">
        <div className="mx-auto flex max-w-md justify-end px-5 pb-4">
          <button
            type="button"
            aria-label="Add spend"
            onClick={() => setAddOpen(true)}
            className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-primary text-background shadow-lg shadow-primary/30 transition-transform duration-150 hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>
      </div>
      
      <AddTransactionFlow open={add_open} onClose={() => setAddOpen(false)} />
      <EditTransactionFlow transaction={editing} onClose={() => setEditing(null)} />
      <SettingsFlow open={settings_open} onClose={() => setSettingsOpen(false)} />
      <InstallHint />
    </div>
  );
}