import { useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  HandCoins,
  Handshake,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { Sheet } from "@/components/ui/Sheet";
import { useInfo } from "@/hooks/useInfo";
import { useLoans } from "@/hooks/useLoans";
import { FormatUtils } from "@/lib/FormatUtils";
import type { LoanDirection, LoanEntry } from "@/types/types";

/**
 * Loans hub — a consumer of the real data layer. The scope carousel + Open /
 * Paid-off totals come from `GET /info` (via useInfo); the feed below comes
 * from `GET /loans` (via useLoans). Every control on this screen writes the
 * provider's `filters`, so the rendered window can never disagree with the
 * fetched feed, and the post-write refetches the loan forms already fire
 * (`refetch_loans(touched_counterparty_ids)` + `/info`) finally show up here.
 */

type ScopeId = "all" | "owed" | "owe";

const SCOPE_CARDS: { id: ScopeId; name: string; direction: LoanDirection | null }[] = [
  { id: "all", name: "All loans", direction: null },
  { id: "owed", name: "You're owed", direction: "GIVEN" },
  { id: "owe", name: "You owe", direction: "BORROWED" },
];

const SCOPE_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 24 : -24, opacity: 0 }),
};

type DirectionMeta = {
  icon: LucideIcon;
  tile: string;
  amount: string;
  sheet_title: string;
};

const DIRECTION_META: Record<LoanDirection, DirectionMeta> = {
  GIVEN: {
    icon: HandCoins,
    tile: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    amount: "text-amber-400",
    sheet_title: "Money you lent",
  },
  BORROWED: {
    icon: Handshake,
    tile: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    amount: "text-violet-400",
    sheet_title: "Money you borrowed",
  },
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/5 bg-black/20 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
              active ? "bg-white/10 text-zinc-100 shadow-sm" : "font-medium text-muted hover:text-zinc-300"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function LoanRow({
  loan,
  currency_symbol,
  time_zone,
  on_open,
}: {
  loan: LoanEntry;
  currency_symbol: string;
  time_zone: string;
  on_open: (loan_id: string) => void;
}) {
  const meta = DIRECTION_META[loan.direction];
  const paid = loan.status === "CLOSED";
  const issued = FormatUtils.formatDate(loan.date_issued, time_zone);
  const sub = loan.description ? `${issued} · ${loan.description}` : issued;

  return (
    <button
      type="button"
      onClick={() => on_open(loan.id)}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/5 bg-surface/80 px-3 py-3 text-left transition-colors hover:bg-surface-hover ${
        paid ? "opacity-75" : ""
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-zinc-100">{loan.counterparty_name}</span>
        <span className="mt-0.5 block truncate text-[10px] text-muted">{sub}</span>
      </span>
      <span className="shrink-0 text-right">
        {paid ? (
          <>
            <span className="block font-mono text-[11px] font-bold text-emerald-600">Paid off</span>
            <span className="block text-[10px] text-muted/70">
              of {currency_symbol}
              {FormatUtils.formatMoney(loan.amount)}
            </span>
          </>
        ) : (
          <>
            <span className={`block font-mono text-xs font-bold tabular-nums ${meta.amount}`}>
              {currency_symbol}
              {FormatUtils.formatMoney(loan.remaining)}
            </span>
            <span className="block text-[10px] text-muted/70">
              of {currency_symbol}
              {FormatUtils.formatMoney(loan.amount)}
            </span>
          </>
        )}
      </span>
    </button>
  );
}

function DetailRow({ label, value, value_class = "text-zinc-200" }: { label: string; value: string; value_class?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className={`min-w-0 truncate text-right text-[11px] font-medium ${value_class}`}>{value}</dd>
    </div>
  );
}

export function LoansPage() {
  const { data: info, loading: info_loading } = useInfo();
  const {
    loans,
    loading,
    is_refreshing,
    loading_more,
    has_next,
    error,
    filters,
    set_filters,
    load_more,
    refetch,
  } = useLoans();

  const currency_symbol = info?.currency_symbol ?? "₦";
  const time_zone = info?.iana_timezone ?? "";
  const counterparties = info?.counterparties ?? [];

  // Server-side filter state. Tab / scope / counterparty are all derived from
  // the provider's filters — the only source of truth — so the UI can never
  // disagree with the fetched window.
  const scope_id: ScopeId =
    filters.direction === null ? "all" : filters.direction === "GIVEN" ? "owed" : "owe";
  const tab: "open" | "paid" = filters.status === "CLOSED" ? "paid" : "open";
  const tab_label = tab === "open" ? "open" : "paid-off";

  const active_counterparty_name =
    counterparties.find((counterparty) => counterparty.id === filters.counterparty_id)?.name ?? null;

  const owed_total = info?.total_you_are_owed ?? 0;
  const owe_total = info?.total_you_owe ?? 0;
  const show_totals = info !== null && !info_loading;
  const empty_message = active_counterparty_name
    ? `No ${tab_label} loans with ${active_counterparty_name}.`
    : `No ${tab_label} loans yet.`;

  const scope_index = SCOPE_CARDS.findIndex((card) => card.id === scope_id);
  const current_scope_card = SCOPE_CARDS[scope_index];

  // Local state is limited to UI that isn't feed data: the counterparty sheet,
  // the open detail-sheet loan id, and the carousel slide's animation direction
  // (the active scope itself lives in the provider's filters).
  const [is_counterparty_sheet_open, setIsCounterpartySheetOpen] = useState(false);
  const [selected_loan_id, setSelectedLoanId] = useState<string | null>(null);
  const [scope_dir, setScopeDir] = useState<1 | -1>(1);
  const scope_touch_x = useRef<number | null>(null);

  // Resolve the open sheet's loan by id from the live feed each render, so a
  // refetch can't strand a stale object — the sheet closes once the id leaves
  // the current window.
  const selected_loan = loans.find((loan) => loan.id === selected_loan_id) ?? null;
  const selected_loan_meta = selected_loan ? DIRECTION_META[selected_loan.direction] : null;

  function handleTabChange(next_tab: "open" | "paid"): void {
    setSelectedLoanId(null);
    set_filters({ status: next_tab === "paid" ? "CLOSED" : "OPEN" });
  }

  function goScope(next_index: number, dir: 1 | -1): void {
    const next_card = SCOPE_CARDS[next_index];
    if (!next_card || next_card.id === scope_id) return;
    setScopeDir(dir);
    setSelectedLoanId(null);
    set_filters({ direction: next_card.direction });
  }

  function scopePrev(): void {
    goScope(scope_index - 1 < 0 ? SCOPE_CARDS.length - 1 : scope_index - 1, -1);
  }

  function scopeNext(): void {
    goScope(scope_index + 1 >= SCOPE_CARDS.length ? 0 : scope_index + 1, 1);
  }

  function handleScopeTouchStart(event: TouchEvent): void {
    scope_touch_x.current = event.touches[0].clientX;
  }

  function handleScopeTouchEnd(event: TouchEvent): void {
    if (scope_touch_x.current === null) return;
    const diff = scope_touch_x.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) scopeNext();
      else scopePrev();
    }
    scope_touch_x.current = null;
  }

  function handleCounterpartySelect(id: string): void {
    setSelectedLoanId(null);
    set_filters({ counterparty_id: id });
  }

  function handleCounterpartyClear(): void {
    setSelectedLoanId(null);
    set_filters({ counterparty_id: null });
  }

  return (
    <div className="relative min-h-dvh pb-28">
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-4">
        {/* Scope carousel — All loans → You're owed → You owe */}
        <div
          onTouchStart={handleScopeTouchStart}
          onTouchEnd={handleScopeTouchEnd}
          className="relative select-none overflow-hidden rounded-3xl p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(20, 20, 24, 0.6) 0%, rgba(12, 12, 15, 0.7) 100%)",
            boxShadow:
              "0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
          }}
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative z-10 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  scope_id === "owed" ? "bg-amber-400" : scope_id === "owe" ? "bg-violet-400" : "bg-zinc-500/70"
                }`}
              />
              <span className="text-sm font-semibold tracking-wide text-zinc-200">
                {current_scope_card.name}
              </span>
            </div>
          </div>

          <div className="relative z-10 min-h-16 overflow-hidden">
            <AnimatePresence mode="wait" custom={scope_dir}>
              <motion.div
                key={scope_id}
                custom={scope_dir}
                variants={SCOPE_SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {scope_id === "all" ? (
                  <div className="flex flex-col gap-2.5 py-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="shrink-0 text-xs font-medium text-zinc-300">You're owed</span>
                      <span className="text-[17px] font-semibold leading-none tabular-nums text-amber-400/90">
                        {show_totals ? `${currency_symbol}${FormatUtils.formatMoney(owed_total)}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="shrink-0 text-xs font-medium text-zinc-300">You owe</span>
                      <span className="text-[17px] font-semibold leading-none tabular-nums text-violet-400/90">
                        {show_totals ? `${currency_symbol}${FormatUtils.formatMoney(owe_total)}` : "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-1">
                    <p
                      className={`text-[22px] font-semibold leading-none tracking-tight tabular-nums ${
                        scope_id === "owed" ? "text-amber-400/90" : "text-violet-400/90"
                      }`}
                    >
                      {show_totals
                        ? `${currency_symbol}${FormatUtils.formatMoney(scope_id === "owed" ? owed_total : owe_total)}`
                        : "—"}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative z-10 mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-muted/60">
            <span>Swipe to switch</span>
          </div>
        </div>

        {/* Loans feed */}
        <div className="space-y-3">
          <Segmented
            options={[
              { value: "open", label: "Open" },
              { value: "paid", label: "Paid off" },
            ]}
            value={tab}
            onChange={handleTabChange}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCounterpartySheetOpen(true)}
              className={
                active_counterparty_name
                  ? "flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary"
                  : "flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/5 bg-surface/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:text-zinc-100"
              }
            >
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{active_counterparty_name ?? "Counterparty"}</span>
            </button>
            <span
              aria-disabled
              className="pointer-events-none flex min-w-0 select-none items-center gap-1.5 rounded-xl border border-white/5 bg-surface/80 px-2.5 py-1.5 text-[11px] font-medium text-muted/70"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Jump to month</span>
            </span>
          </div>

          {error && loans.length > 0 ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
              <p className="min-w-0 truncate text-[11px] text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="shrink-0 cursor-pointer text-[11px] font-semibold text-red-400 hover:text-red-300"
              >
                Retry
              </button>
            </div>
          ) : null}

          {error && loans.length === 0 ? (
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
          ) : loans.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-surface/40 px-4 py-10 text-center">
              <p className="text-xs text-zinc-300">{empty_message}</p>
            </div>
          ) : (
            <div className="space-y-2 pt-0.5">
              {is_refreshing ? <p className="px-1 text-[10px] text-muted">Refreshing…</p> : null}
              {loans.map((loan) => (
                <LoanRow
                  key={loan.id}
                  loan={loan}
                  currency_symbol={currency_symbol}
                  time_zone={time_zone}
                  on_open={setSelectedLoanId}
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
        </div>
      </div>

      {/* Loan detail / repayment history */}
      <Sheet
        open={selected_loan !== null}
        on_close={() => setSelectedLoanId(null)}
        title={selected_loan_meta?.sheet_title ?? ""}
      >
        {selected_loan && selected_loan_meta ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${selected_loan_meta.tile}`}>
                <selected_loan_meta.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-zinc-100">{selected_loan.counterparty_name}</p>
              {selected_loan.description ? (
                <p className="max-w-full px-2 text-[11px] text-zinc-400">{selected_loan.description}</p>
              ) : null}
              <p className="text-[10px] text-muted">
                {FormatUtils.formatDate(selected_loan.date_issued, time_zone)}
              </p>
            </div>

            <dl className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-black/20">
              <DetailRow
                label="Original amount"
                value={`${currency_symbol}${FormatUtils.formatMoney(selected_loan.amount)}`}
              />
              <DetailRow
                label="Repaid"
                value={`${currency_symbol}${FormatUtils.formatMoney(selected_loan.total_repaid)}`}
                value_class="text-emerald-400"
              />
              <DetailRow
                label="Remaining"
                value={`${currency_symbol}${FormatUtils.formatMoney(selected_loan.remaining)}`}
                value_class={selected_loan_meta.amount}
              />
            </dl>

            <div>
              <p className="px-0.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                Repayment events ({selected_loan.repayments.length})
              </p>
              {selected_loan.repayments.length === 0 ? (
                <div className="mt-2 rounded-2xl border border-white/5 bg-black/20 px-4 py-6 text-center">
                  <p className="text-xs text-muted">No repayments recorded on this loan yet.</p>
                </div>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {selected_loan.repayments.map((repayment) => {
                    const incoming = selected_loan.direction === "GIVEN";
                    const repaid_date = FormatUtils.formatDate(repayment.date_repaid, time_zone);
                    return (
                      <div
                        key={repayment.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 px-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                              incoming
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {incoming ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-zinc-200">{repayment.description ?? "Repayment"}</p>
                            <p className="mt-0.5 truncate text-[10px] text-muted">
                              {repayment.account ? `${repaid_date} · ${repayment.account.name}` : repaid_date}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 font-mono text-xs font-bold tabular-nums ${incoming ? "text-emerald-400" : "text-rose-400"}`}>
                          {incoming ? "+" : "-"}
                          {currency_symbol}
                          {FormatUtils.formatMoney(repayment.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Sheet>

      {/* Filter by counterparty */}
      <PickerSheet
        open={is_counterparty_sheet_open}
        title="Filter by counterparty"
        items={counterparties}
        selected_id={filters.counterparty_id}
        on_select={handleCounterpartySelect}
        on_close={() => setIsCounterpartySheetOpen(false)}
        show_none={filters.counterparty_id !== null}
        none_label="All counterparties"
        on_none={handleCounterpartyClear}
        search_placeholder="Search counterparties"
        empty_message="No counterparties"
      />
    </div>
  );
}
