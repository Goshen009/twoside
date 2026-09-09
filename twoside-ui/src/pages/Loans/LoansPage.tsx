import { useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  HandCoins,
  Handshake,
  Search,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PickerSheet } from "@/components/ui/PickerSheet";
import { Sheet } from "@/components/ui/Sheet";

/**
 * TEMPORARY VISUAL PROTOTYPE — mock data, no backend/providers.
 * Loans-only feed for now: summary, Open/Paid-off tabs, counterparty filter
 * (like category on Home), description search + jump-to-date, and a loan's
 * repayment sheet. To be replaced.
 */

type MockDirection = "GIVEN" | "BORROWED";
type MockStatus = "OPEN" | "CLOSED";

type MockRepayment = {
  id: string;
  amount: number;
  date_repaid: string;
  description: string | null;
  account: string;
};

type MockLoan = {
  id: string;
  person_id: string;
  direction: MockDirection;
  status: MockStatus;
  amount: number;
  date_issued: string;
  description: string;
  repayments: MockRepayment[];
};

type PersonSummary = {
  id: string;
  name: string;
  owes_you: number;
  you_owe: number;
  open_count: number;
  settled_count: number;
};

const PEOPLE: Record<string, string> = {
  amaka: "Amaka Okafor",
  tunde: "Tunde Bakare",
  ifeoma: "Ifeoma Eze",
  chidi: "Chidi Nwosu",
};

const COUNTERPARTY_OPTIONS: { id: string; name: string }[] = Object.keys(PEOPLE)
  .map((id) => ({ id, name: PEOPLE[id] }))
  .sort((a, b) => a.name.localeCompare(b.name));

const SCOPE_CARDS: { id: "all" | "owed" | "owe"; name: string }[] = [
  { id: "all", name: "All loans" },
  { id: "owed", name: "You're owed" },
  { id: "owe", name: "You owe" },
];

const SCOPE_SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 24 : -24, opacity: 0 }),
};

const MOCK_LOANS: MockLoan[] = [
  {
    id: "a1",
    person_id: "amaka",
    direction: "GIVEN",
    status: "OPEN",
    amount: 150_000,
    date_issued: "2026-01-15",
    description: "December rent top-up",
    repayments: [
      { id: "r1", amount: 50_000, date_repaid: "2026-02-20", description: "Part payment", account: "GTBank" },
      { id: "r2", amount: 40_000, date_repaid: "2026-05-02", description: null, account: "GTBank" },
    ],
  },
  {
    id: "a2",
    person_id: "amaka",
    direction: "GIVEN",
    status: "OPEN",
    amount: 25_000,
    date_issued: "2026-04-02",
    description: "Market float",
    repayments: [],
  },
  {
    id: "a3",
    person_id: "amaka",
    direction: "GIVEN",
    status: "CLOSED",
    amount: 40_000,
    date_issued: "2025-08-10",
    description: "Phone repair",
    repayments: [{ id: "r3", amount: 40_000, date_repaid: "2025-11-03", description: null, account: "Kuda" }],
  },
  {
    id: "t1",
    person_id: "tunde",
    direction: "BORROWED",
    status: "OPEN",
    amount: 200_000,
    date_issued: "2026-02-20",
    description: "Shop restock",
    repayments: [{ id: "r4", amount: 50_000, date_repaid: "2026-03-15", description: null, account: "Wema" }],
  },
  {
    id: "t2",
    person_id: "tunde",
    direction: "BORROWED",
    status: "CLOSED",
    amount: 80_000,
    date_issued: "2025-06-05",
    description: "Generator fuel",
    repayments: [{ id: "r5", amount: 80_000, date_repaid: "2025-09-12", description: null, account: "Wema" }],
  },
  {
    id: "i1",
    person_id: "ifeoma",
    direction: "GIVEN",
    status: "OPEN",
    amount: 30_000,
    date_issued: "2025-12-05",
    description: "School fees support",
    repayments: [{ id: "r6", amount: 10_000, date_repaid: "2026-01-08", description: "First instalment", account: "Access" }],
  },
  {
    id: "i2",
    person_id: "ifeoma",
    direction: "BORROWED",
    status: "OPEN",
    amount: 45_000,
    date_issued: "2026-01-10",
    description: "Car repair emergency",
    repayments: [],
  },
  {
    id: "i3",
    person_id: "ifeoma",
    direction: "BORROWED",
    status: "CLOSED",
    amount: 60_000,
    date_issued: "2025-03-18",
    description: "Flight ticket",
    repayments: [{ id: "r7", amount: 60_000, date_repaid: "2025-04-01", description: null, account: "UBA" }],
  },
  {
    id: "c1",
    person_id: "chidi",
    direction: "GIVEN",
    status: "OPEN",
    amount: 500_000,
    date_issued: "2026-03-01",
    description: "Land purchase deposit",
    repayments: [],
  },
];

const DIRECTION_META: Record<
  MockDirection,
  { icon: LucideIcon; tile: string; amount: string; caption: string; sheet_title: string }
> = {
  GIVEN: {
    icon: HandCoins,
    tile: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    amount: "text-amber-400",
    caption: "You're owed",
    sheet_title: "Money you lent",
  },
  BORROWED: {
    icon: Handshake,
    tile: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    amount: "text-violet-400",
    caption: "You owe",
    sheet_title: "Money you borrowed",
  },
};

function money(amount: number): string {
  return `₦${amount.toLocaleString("en-US")}`;
}

function format_date(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function month_label(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function repaid_of(loan: MockLoan): number {
  return loan.repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
}

function remaining_of(loan: MockLoan): number {
  return loan.amount - repaid_of(loan);
}

function build_people(loans: MockLoan[]): PersonSummary[] {
  const map = new Map<string, PersonSummary>();
  for (const loan of loans) {
    const entry =
      map.get(loan.person_id) ??
      ({ id: loan.person_id, name: PEOPLE[loan.person_id], owes_you: 0, you_owe: 0, open_count: 0, settled_count: 0 } satisfies PersonSummary);
    if (loan.status === "OPEN") {
      entry.open_count++;
      const remaining = remaining_of(loan);
      if (loan.direction === "GIVEN") entry.owes_you += remaining;
      else entry.you_owe += remaining;
    } else {
      entry.settled_count++;
    }
    map.set(loan.person_id, entry);
  }
  return [...map.values()]
    .filter((person) => person.open_count > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

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

function PersonRow({ person, on_open }: { person: PersonSummary; on_open: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => on_open(person.id)}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-surface/80 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold text-zinc-100">{person.name}</span>
        <span className="mt-1 flex flex-col gap-0.5">
          {person.owes_you > 0 ? (
            <span className="flex items-center gap-1.5 text-[11px]">
              <HandCoins className="h-3 w-3 shrink-0 text-amber-400/70" />
              <span className="text-muted">Owes you</span>
              <span className="font-semibold tabular-nums text-zinc-200">{money(person.owes_you)}</span>
            </span>
          ) : null}
          {person.you_owe > 0 ? (
            <span className="flex items-center gap-1.5 text-[11px]">
              <Handshake className="h-3 w-3 shrink-0 text-violet-400/70" />
              <span className="text-muted">You owe</span>
              <span className="font-semibold tabular-nums text-zinc-200">{money(person.you_owe)}</span>
            </span>
          ) : null}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted/40 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function LoanRow({
  loan,
  person_name,
  on_open,
  hide_person = false,
}: {
  loan: MockLoan;
  person_name: string;
  on_open: (loan: MockLoan) => void;
  hide_person?: boolean;
}) {
  const meta = DIRECTION_META[loan.direction];
  const paid = loan.status === "CLOSED";
  const title = hide_person ? loan.description || meta.sheet_title : person_name;
  const sub = hide_person
    ? format_date(loan.date_issued)
    : loan.description
      ? `${format_date(loan.date_issued)} · ${loan.description}`
      : format_date(loan.date_issued);

  return (
    <button
      type="button"
      id={`loan-${loan.id}`}
      onClick={() => on_open(loan)}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/5 bg-surface/80 px-3 py-3 text-left transition-colors hover:bg-surface-hover ${
        paid ? "opacity-75" : ""
      }`}
    >
      {/*<span
        aria-hidden
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${loan.direction === "GIVEN" ? "bg-amber-400/80" : "bg-violet-400/80"}`}
      />*/}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium text-zinc-100">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-muted">{sub}</span>
      </span>
      <span className="shrink-0 text-right">
        {paid ? (
          <>
            <span className={`block font-mono text-[11px] font-bold text-emerald-600`}>Paid off</span>
            <span className="block text-[10px] text-muted/70">of {money(loan.amount)}</span>
          </>
        ) : (
          <>
            <span className={`block font-mono text-xs font-bold tabular-nums ${meta.amount}`}>{money(remaining_of(loan))}</span>
            <span className="block text-[10px] text-muted/70">of {money(loan.amount)}</span>
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
  const [loan_tab, setLoanTab] = useState<"open" | "paid">("open");
  const [scope, setScope] = useState<"all" | "owed" | "owe">("all");
  const [scope_dir, setScopeDir] = useState<1 | -1>(1);
  const scope_touch_x = useRef<number | null>(null);
  const [counterparty_id, setCounterpartyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [is_counterparty_sheet_open, setIsCounterpartySheetOpen] = useState(false);
  const [person_id, setPersonId] = useState<string | null>(null);
  const [selected_loan, setSelectedLoan] = useState<MockLoan | null>(null);
  const [is_date_sheet_open, setIsDateSheetOpen] = useState(false);

  const people = build_people(MOCK_LOANS);
  const owed_total = people.reduce((sum, person) => sum + person.owes_you, 0);
  const owe_total = people.reduce((sum, person) => sum + person.you_owe, 0);
  const owed_people_count = people.filter((person) => person.owes_you > 0).length;
  const owe_people_count = people.filter((person) => person.you_owe > 0).length;

  const sorted_loans = [...MOCK_LOANS].sort((a, b) => b.date_issued.localeCompare(a.date_issued));
  const open_loans = sorted_loans.filter((loan) => loan.status === "OPEN");
  const paid_loans = sorted_loans.filter((loan) => loan.status === "CLOSED");

  const trimmed_query = query.trim().toLowerCase();

  function loan_matches(loan: MockLoan): boolean {
    const searchable = `${loan.description} ${PEOPLE[loan.person_id]}`.toLowerCase();
    const matches_query = !trimmed_query || searchable.includes(trimmed_query);
    const matches_counterparty = counterparty_id === null || loan.person_id === counterparty_id;
    const matches_scope =
      scope === "all" || (scope === "owed" ? loan.direction === "GIVEN" : loan.direction === "BORROWED");
    return matches_query && matches_counterparty && matches_scope;
  }

  const visible_open = open_loans.filter(loan_matches);
  const visible_paid = paid_loans.filter(loan_matches);
  const visible_loans = loan_tab === "open" ? visible_open : visible_paid;
  const active_counterparty_name = counterparty_id ? (PEOPLE[counterparty_id] ?? null) : null;

  const scope_index = Math.max(0, SCOPE_CARDS.findIndex((card) => card.id === scope));
  const current_scope_card = SCOPE_CARDS[scope_index];

  function go_scope(next_index: number, dir: 1 | -1): void {
    const next_card = SCOPE_CARDS[next_index];
    if (!next_card || next_card.id === scope) return;
    setScopeDir(dir);
    setScope(next_card.id);
  }

  function scope_prev(): void {
    const len = SCOPE_CARDS.length;
    go_scope(scope_index - 1 < 0 ? len - 1 : scope_index - 1, -1);
  }

  function scope_next(): void {
    go_scope(scope_index + 1 >= SCOPE_CARDS.length ? 0 : scope_index + 1, 1);
  }

  function scope_touch_start(event: TouchEvent): void {
    scope_touch_x.current = event.touches[0].clientX;
  }

  function scope_touch_end(event: TouchEvent): void {
    if (scope_touch_x.current === null) return;
    const diff = scope_touch_x.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) scope_next();
      else scope_prev();
    }
    scope_touch_x.current = null;
  }

  const months = (() => {
    const map = new Map<string, { label: string; count: number; first_id: string }>();
    for (const loan of visible_loans) {
      const date = new Date(loan.date_issued);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const existing = map.get(key);
      if (existing) existing.count++;
      else map.set(key, { label: month_label(loan.date_issued), count: 1, first_id: loan.id });
    }
    return [...map.values()];
  })();

  const selected_person = person_id ? (people.find((person) => person.id === person_id) ?? null) : null;
  const person_loans = person_id ? sorted_loans.filter((loan) => loan.person_id === person_id) : [];
  const person_open = person_loans.filter((loan) => loan.status === "OPEN");
  const person_settled = person_loans.filter((loan) => loan.status === "CLOSED");

  function open_person(id: string): void {
    setPersonId(id);
    window.scrollTo({ top: 0 });
  }

  function close_person(): void {
    setPersonId(null);
    window.scrollTo({ top: 0 });
  }

  function jump_to_month(first_loan_id: string): void {
    setIsDateSheetOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(`loan-${first_loan_id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function slide_class(is_person: boolean): string {
    return is_person ? "space-y-4" : "space-y-4";
  }

  const selected_loan_meta = selected_loan ? DIRECTION_META[selected_loan.direction] : null;
  const selected_loan_person = selected_loan ? PEOPLE[selected_loan.person_id] : "";

  return (
    <div className="relative min-h-dvh pb-28">
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-4">
        <AnimatePresence mode="wait" initial={false}>
          {selected_person ? (
            <motion.section
              key={`person-${selected_person.id}`}
              initial={{ x: 56, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 56, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={close_person}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-medium text-muted transition-colors hover:text-zinc-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Loans
              </button>

              <div className="pt-1">
                <h1 className="truncate text-lg font-semibold text-zinc-100">{selected_person.name}</h1>
              </div>

              <div className="flex gap-2.5">
                {selected_person.owes_you > 0 ? (
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-surface/80 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[10px] text-muted">
                      <HandCoins className="h-3 w-3 shrink-0 text-amber-400/70" />
                      Owes you
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold tabular-nums text-zinc-100">
                      {money(selected_person.owes_you)}
                    </p>
                  </div>
                ) : null}
                {selected_person.you_owe > 0 ? (
                  <div className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-surface/80 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[10px] text-muted">
                      <Handshake className="h-3 w-3 shrink-0 text-violet-400/70" />
                      You owe
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold tabular-nums text-zinc-100">
                      {money(selected_person.you_owe)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2 pt-1">
                <p className="px-0.5 text-[10px] font-mono uppercase tracking-wider text-muted">Open ({person_open.length})</p>
                {person_open.map((loan) => (
                  <LoanRow key={loan.id} loan={loan} person_name={PEOPLE[loan.person_id]} on_open={setSelectedLoan} hide_person />
                ))}
              </div>

              {person_settled.length > 0 ? (
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <p className="px-0.5 text-[10px] font-mono uppercase tracking-wider text-muted">Settled ({person_settled.length})</p>
                  {person_settled.map((loan) => (
                    <LoanRow key={loan.id} loan={loan} person_name={PEOPLE[loan.person_id]} on_open={setSelectedLoan} hide_person />
                  ))}
                </div>
              ) : null}
            </motion.section>
          ) : (
            <motion.section
              key="hub"
              initial={{ x: -56, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -56, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Scope carousel — All loans → You're owed → You owe */}
              <div
                onTouchStart={scope_touch_start}
                onTouchEnd={scope_touch_end}
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
                        scope === "owed" ? "bg-amber-400" : scope === "owe" ? "bg-violet-400" : "bg-zinc-500/70"
                      }`}
                    />
                    <span className="text-sm font-semibold tracking-wide text-zinc-200">
                      {current_scope_card.name}
                    </span>
                  </div>
                  {/*<div className="rounded-lg border border-white/5 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-muted">
                    {scope_index + 1} / {SCOPE_CARDS.length}
                  </div>*/}
                </div>

                <div className="relative z-10 min-h-16 overflow-hidden">
                  <AnimatePresence mode="wait" custom={scope_dir}>
                    <motion.div
                      key={scope}
                      custom={scope_dir}
                      variants={SCOPE_SLIDE_VARIANTS}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      {scope === "all" ? (
                        <div className="flex flex-col gap-2.5 py-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="shrink-0 text-xs font-medium text-zinc-300">You're owed</span>
                            <span className="text-[17px] font-semibold leading-none tabular-nums text-amber-400/90">
                              {money(owed_total)}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="shrink-0 text-xs font-medium text-zinc-300">You owe</span>
                            <span className="text-[17px] font-semibold leading-none tabular-nums text-violet-400/90">
                              {money(owe_total)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-1">
                          <p
                            className={`text-[22px] font-semibold leading-none tracking-tight tabular-nums ${
                              scope === "owed" ? "text-amber-400/90" : "text-violet-400/90"
                            }`}
                          >
                            {scope === "owed" ? money(owed_total) : money(owe_total)}
                          </p>
                          <p className="mt-1.5 text-[10px] text-muted">
                            {(scope === "owed" ? owed_people_count : owe_people_count)}{" "}
                            {(scope === "owed" ? owed_people_count : owe_people_count) === 1 ? "person" : "people"}
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Segmented
                        options={[
                          { value: "open", label: "Open" },
                          { value: "paid", label: "Paid off" },
                        ]}
                        value={loan_tab}
                        onChange={setLoanTab}
                      />
                    </div>
                  </div>

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
                    {counterparty_id ? (
                      <button
                        type="button"
                        onClick={() => setCounterpartyId(null)}
                        aria-label="Clear counterparty filter"
                        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-zinc-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  
                    <button
                      type="button"
                      onClick={() => setIsDateSheetOpen(true)}
                      className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl border border-white/5 bg-surface/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:text-zinc-100"
                    >
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Jump to month</span>
                    </button>
</div>

                  {/*<div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/60" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search description or person"
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:border-white/20 focus:outline-none"
                    />
                  </div>*/}

                  {visible_loans.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-surface/40 px-4 py-10 text-center">
                      <p className="text-xs text-zinc-300">
                        {trimmed_query
                          ? `No ${loan_tab === "open" ? "open" : "paid-off"} loans match that search.`
                          : active_counterparty_name
                            ? `No ${loan_tab === "open" ? "open" : "paid-off"} loans with ${active_counterparty_name}.`
                            : `No ${loan_tab === "open" ? "open" : "paid-off"} loans yet.`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-0.5">
                      {visible_loans.map((loan) => (
                        <LoanRow key={loan.id} loan={loan} person_name={PEOPLE[loan.person_id]} on_open={setSelectedLoan} />
                      ))}
                    </div>
                  )}
                </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Loan detail / repayment history */}
      <Sheet
        open={selected_loan !== null}
        on_close={() => setSelectedLoan(null)}
        title={selected_loan_meta?.sheet_title ?? ""}
      >
        {selected_loan && selected_loan_meta ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${selected_loan_meta.tile}`}>
                <selected_loan_meta.icon className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-zinc-100">{selected_loan_person}</p>
              {selected_loan.description ? (
                <p className="max-w-full px-2 text-[11px] text-zinc-400">{selected_loan.description}</p>
              ) : null}
              <p className="text-[10px] text-muted">{format_date(selected_loan.date_issued)}</p>
            </div>

            <dl className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-black/20">
              <DetailRow label="Original amount" value={money(selected_loan.amount)} />
              <DetailRow label="Repaid" value={money(repaid_of(selected_loan))} value_class="text-emerald-400" />
              <DetailRow label="Remaining" value={money(remaining_of(selected_loan))} value_class={selected_loan_meta.amount} />
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
                              {format_date(repayment.date_repaid)} · {repayment.account}
                            </p>
                          </div>
                        </div>
                        <span className={`shrink-0 font-mono text-xs font-bold tabular-nums ${incoming ? "text-emerald-400" : "text-rose-400"}`}>
                          {incoming ? "+" : "-"}
                          {money(repayment.amount)}
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

      {/* Jump to date */}
      <Sheet open={is_date_sheet_open} on_close={() => setIsDateSheetOpen(false)} title="Jump to month">
        {months.length === 0 ? (
          <p className="px-1 py-3 text-center text-xs text-muted">No loans in this view yet.</p>
        ) : (
          <div className="space-y-1.5">
            {months.map((month) => (
              <button
                type="button"
                key={month.label}
                onClick={() => jump_to_month(month.first_id)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-xs font-medium text-zinc-200">{month.label}</span>
                <span className="font-mono text-[10px] text-muted">
                  {month.count} loan{month.count === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        )}
      </Sheet>

      {/* Filter by counterparty */}
      <PickerSheet
        open={is_counterparty_sheet_open}
        title="Filter by counterparty"
        items={COUNTERPARTY_OPTIONS}
        selected_id={counterparty_id}
        on_select={(id) => setCounterpartyId(id)}
        on_close={() => setIsCounterpartySheetOpen(false)}
        show_none={counterparty_id !== null}
        none_label="All counterparties"
        on_none={() => setCounterpartyId(null)}
        search_placeholder="Search counterparties"
        empty_message="No counterparties"
      />
    </div>
  );
}
