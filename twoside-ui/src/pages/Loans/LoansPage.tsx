import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { DateTime } from "luxon";
import Constants from "@/lib/Constants";
import { useUIStore } from "@/stores/useUIStore";

import { Eye, EyeOff } from "lucide-react"  
import type { PanInfo } from "framer-motion"

const SIDES: Side[] = ["owed", "owe"];

const cardVariants = {
	enter: (dir: 1 | -1) => ({ x: dir * 40, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: 1 | -1) => ({ x: dir * -40, opacity: 0 }),
};

function LoansSummaryCard({
	side,
	onChange,
	totals,
}: {
	side: Side;
	onChange: (s: Side) => void;
	totals: Record<Side, number>;
}) {
	const money = useMoney();
	const is_hidden = useUIStore((s) => s.is_amounts_hidden);
	const toggleAmountsHidden = useUIStore((s) => s.toggleAmountsHidden);
	const [direction, setDirection] = useState<1 | -1>(1);

	function go(next: Side, dir: 1 | -1) {
		if (next === side) return;
		setDirection(dir);
		onChange(next);
	}

	function handleDragEnd(_: unknown, info: PanInfo) {
		if (info.offset.x < -50) go("owe", 1); // swipe left -> next
		else if (info.offset.x > 50) go("owed", -1); // swipe right -> previous
	}

	const st = SIDE_STYLE[side];

	return (
		<motion.section
			aria-label="Loan totals"
			className="relative cursor-grab overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-lg active:cursor-grabbing"
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={0}
			onDragEnd={handleDragEnd}
		>
			<div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl transition-colors ${st.glow}`} />

			<div className="flex justify-end">
				<button
					type="button"
					aria-label="Toggle amounts"
					onClick={toggleAmountsHidden}
					className="rounded-full p-1 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
				>
					{is_hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
				</button>
			</div>

			<div className="overflow-hidden pb-1 text-center">
				<AnimatePresence mode="wait" custom={direction} initial={false}>
					<motion.div
						key={side}
						custom={direction}
						variants={cardVariants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{ duration: 0.2, ease: "easeInOut" }}
					>
						<p className={`mb-1 text-xs font-semibold uppercase tracking-wider ${st.text}`}>{st.label}</p>
						<span className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground">
							{money(totals[side])}
						</span>
					</motion.div>
				</AnimatePresence>

				<div className="mt-3 flex items-center justify-center gap-1.5">
					{SIDES.map((s) => (
						<span
							key={s}
							className={`h-1.5 rounded-full transition-all ${s === side ? "w-4 bg-primary" : "w-1.5 bg-white/20"}`}
						/>
					))}
				</div>
			</div>
		</motion.section>
	);
}

/* ───────────── dummy data ───────────── */

type EventType = "GIVE_LOAN" | "BORROW" | "REPAY_LOAN" | "RECEIVE_REPAYMENT";

interface LoanEvent {
	id: string;
	type: EventType;
	amount: number; // excludes fee
	date: string; // UTC ISO
	description: string;
	fee: number;
	breakdown: { account: string; amount: number }[];
}

interface Person {
	id: string;
	name: string;
	events: LoanEvent[];
}

let n = 0;
const ev = (
	type: EventType,
	amount: number,
	date: string,
	description: string,
	fee = 0,
	breakdown: { account: string; amount: number }[] = [{ account: "Opay", amount }],
): LoanEvent => ({ id: String(++n), type, amount, date, description, fee, breakdown });

const PEOPLE: Person[] = [
	{
		id: "tunde",
		name: "Tunde",
		events: [
			ev("GIVE_LOAN", 2000, "2026-09-10T10:00:00.000Z", "Lunch money"),
			ev("RECEIVE_REPAYMENT", 500, "2026-09-15T12:30:00.000Z", "Part payback"),
			ev("BORROW", 3000, "2026-09-20T09:15:00.000Z", "Fuel"),
			ev("BORROW", 5000, "2026-09-23T16:40:00.000Z", "Rent top-up"),
			ev("REPAY_LOAN", 4000, "2026-09-28T18:05:00.000Z", "Sent back", 10, [
				{ account: "Opay", amount: 3000 },
				{ account: "Kuda", amount: 1000 },
			]),
		],
	},
	{
		id: "ada",
		name: "Ada",
		events: [
			ev("GIVE_LOAN", 15000, "2026-09-05T11:00:00.000Z", "Shop restock"),
			ev("RECEIVE_REPAYMENT", 5000, "2026-09-18T14:00:00.000Z", "First instalment"),
		],
	},
	{ id: "chidi", name: "Chidi", events: [ev("GIVE_LOAN", 7000, "2026-09-12T08:20:00.000Z", "School fees help")] },
	{
		id: "ngozi",
		name: "Ngozi",
		events: [
			ev("BORROW", 20000, "2026-09-01T10:00:00.000Z", "Emergency"),
			ev("REPAY_LOAN", 5000, "2026-09-30T13:10:00.000Z", "Monthly payback"),
		],
	},
	{ id: "kemi", name: "Kemi", events: [ev("GIVE_LOAN", 25000, "2026-09-30T17:45:00.000Z", "Business loan")] },
	{
		id: "femi",
		name: "Femi",
		events: [
			ev("GIVE_LOAN", 3000, "2026-08-20T10:00:00.000Z", "Data and airtime"),
			ev("RECEIVE_REPAYMENT", 3000, "2026-09-02T10:00:00.000Z", "Cleared"),
		],
	},
	{
		id: "bola",
		name: "Bola",
		events: [
			ev("BORROW", 1500, "2026-08-15T10:00:00.000Z", "Uber"),
			ev("REPAY_LOAN", 1500, "2026-08-30T10:00:00.000Z", "Cleared"),
		],
	},
];

const TIMEZONE = "Africa/Lagos";
const CURRENCY = "₦";

/* ───────────── helpers ───────────── */

const sum = (events: LoanEvent[], types: EventType[]) =>
	events.filter((e) => types.includes(e.type)).reduce((acc, e) => acc + Math.round(e.amount * 100), 0) / 100;

function balances(p: Person) {
	return {
		owed: Math.max(0, sum(p.events, ["GIVE_LOAN"]) - sum(p.events, ["RECEIVE_REPAYMENT"])),
		owe: Math.max(0, sum(p.events, ["BORROW"]) - sum(p.events, ["REPAY_LOAN"])),
	};
}

// function progress(p: Person, side: Side) {
// 	const [lent, back]: EventType[] = side === "owed" ? ["GIVE_LOAN", "RECEIVE_REPAYMENT"] : ["BORROW", "REPAY_LOAN"];
// 	const total = sum(p.events, [lent]);
// 	const paid = sum(p.events, [back]);
// 	return { total, pct: total > 0 ? Math.min(100, (paid / total) * 100) : 0 };
// }

const fmt = (v: number) =>
	`${CURRENCY}${v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function useMoney() {
	const hidden = useUIStore((s) => s.is_amounts_hidden);
	return (v: number) => (hidden ? "••••" : fmt(v));
}

function dayLabel(iso: string): string {
	const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(TIMEZONE);
	const now = DateTime.now().setZone(TIMEZONE);
	if (dt.hasSame(now, "day")) return "Today";
	if (dt.hasSame(now.minus({ days: 1 }), "day")) return "Yesterday";
	return dt.toFormat("MMMM d, yyyy");
}

/* ───────────── segmented control ───────────── */

function Segmented<T extends string>({
	id,
	value,
	options,
	onChange,
}: {
	id: string; // unique per instance, drives the sliding pill
	value: T;
	options: { value: T; label: string; text: string }[];
	onChange: (v: T) => void;
}) {
	return (
		<div className="relative flex rounded-full border border-border bg-surface p-1">
			{options.map((o) => {
				const on = o.value === value;
				return (
					<button
						key={o.value}
						type="button"
						onClick={() => onChange(o.value)}
						className="relative flex-1 rounded-full py-2 text-xs font-semibold"
					>
						{on && (
							<motion.span
								layoutId={id}
								className="absolute inset-0 rounded-full bg-surface-hover"
								transition={{ type: "spring", damping: 30, stiffness: 400 }}
							/>
						)}
						<span className={`relative transition-colors ${on ? o.text : "text-muted"}`}>{o.label}</span>
					</button>
				);
			})}
		</div>
	);
}

/* ───────────── list screen ───────────── */

type Side = "owed" | "owe";

const SIDE_STYLE = {
	owed: { label: "Owed to you", text: "text-income", border: "border-income/40", glow: "bg-income/10", bar: "bg-income" },
	owe: { label: "You owe", text: "text-expense", border: "border-expense/40", glow: "bg-expense/10", bar: "bg-expense" },
} as const;

export function LoansPage() {
	const money = useMoney();
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState<{ person: Person; side: Side } | null>(null);

	const total_owed = PEOPLE.reduce((a, p) => a + balances(p).owed, 0);
	const total_owe = PEOPLE.reduce((a, p) => a + balances(p).owe, 0);
	const [side, setSide] = useState<Side>(total_owed > 0 || total_owe === 0 ? "owed" : "owe");

	const { active, settled, total } = useMemo(() => {
		const q = query.trim().toLowerCase();
		const rows = PEOPLE.map((p) => ({ p, bal: balances(p)[side] }));
		const visible = rows.filter((r) => r.p.name.toLowerCase().includes(q));
		return {
			active: visible.filter((r) => r.bal > 0).sort((a, b) => b.bal - a.bal),
			settled: visible.filter((r) => r.bal <= 0).sort((a, b) => a.p.name.localeCompare(b.p.name)),
			total: rows.reduce((a, r) => a + r.bal, 0),
		};
	}, [query, side]);

	const amount_text = side === "owed" ? "text-receive-repayment" : "text-repay-loan";

	return (
		<>
			<div className="min-h-screen px-5 pb-28">
				<h1 className="pt-6 text-xl font-bold tracking-tight text-foreground">Loans</h1>

				{/*<div className="mt-4 flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 focus-within:border-primary">
					<Search className="h-3.5 w-3.5 shrink-0 text-muted" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search people"
						className="flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted/60"
					/>
				</div>*/}

				{/*<div className="mt-4">
					<Segmented<Side>
						id="loans-side"
						value={side}
						onChange={setSide}
						options={[
							{ value: "owed", label: "Owed to you", text: "text-receive-repayment" },
							{ value: "owe", label: "You owe", text: "text-repay-loan" },
						]}
					/>
				</div>*/}

				{/*<p className="mt-3 px-1 text-2xs font-medium text-muted">
					Total <span className={`font-bold tabular-nums ${amount_text}`}>{money(total)}</span>
				</p>*/}

				<div className="mt-4">
					<LoansSummaryCard side={side} onChange={setSide} totals={{ owed: total_owed, owe: total_owe }} />
				</div>

				{/*<div className="mt-5 grid grid-cols-2 gap-3">
					{(["owed", "owe"] as Side[]).map((s) => {
						const st = SIDE_STYLE[s];
						const on = s === side;
						const value = s === "owed" ? total_owed : total_owe;
						return (
							<button
								key={s}
								type="button"
								onClick={() => setSide(s)}
								className={`relative overflow-hidden rounded-2xl border bg-surface p-4 text-left transition-colors ${on ? st.border : "border-border"}`}
							>
								{on && <motion.span layoutId="side-glow" className={`absolute inset-0 ${st.glow}`} />}
								<span className={`relative block text-2xs font-semibold uppercase tracking-wider ${on ? st.text : "text-muted"}`}>
									{st.label}
								</span>
								<span className={`relative mt-2 block text-lg font-extrabold tracking-tight tabular-nums ${on ? "text-foreground" : "text-muted"}`}>
									{money(value)}
								</span>
							</button>
						);
					})}
				</div>*/}

				{/*<div className="mt-4 divide-y divide-border">
					{active.map(({ p, bal }) => (
						<button
							key={p.id}
							type="button"
							onClick={() => setSelected({ person: p, side })}
							className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
						>
							<span className="truncate text-[13px] font-medium text-foreground">{p.name}</span>
							<span className="flex shrink-0 items-center gap-1.5">
								<span className={`text-[13px] font-semibold tabular-nums ${amount_text}`}>{money(bal)}</span>
								<ChevronRight className="h-3.5 w-3.5 text-muted" />
							</span>
						</button>
					))}
				</div>*/}

				<div className="mt-4 space-y-2">
					{active.map(({ p, bal }) => (
						<button
							key={p.id}
							type="button"
							onClick={() => setSelected({ person: p, side })}
							className="relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-surface py-3.5 pl-5 pr-4 text-left transition-colors active:bg-surface-hover"
						>
							<span className={`absolute inset-y-3.5 left-0 w-[3px] rounded-r-full bg-current ${SIDE_STYLE[side].text}`} />
							<span className="min-w-0">
								<span className="block truncate text-[13px] font-semibold text-foreground">{p.name}</span>
								<span className={`mt-1 block text-base font-bold tabular-nums ${SIDE_STYLE[side].text}`}>
									{money(bal)}
								</span>
							</span>
							<ChevronRight className="h-4 w-4 shrink-0 text-muted" />
						</button>
					))}
				</div>

				{/*<motion.div
					key={side}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.2 }}
					className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface"
				>
					{active.map(({ p, bal }) => {
						const pr = progress(p, side);
						return (
							<button
								key={p.id}
								type="button"
								onClick={() => setSelected({ person: p, side })}
								className="block w-full px-4 py-3.5 text-left transition-colors active:bg-surface-hover"
							>
								<span className="flex items-center justify-between gap-3">
									<span className="truncate text-[13px] font-semibold text-foreground">{p.name}</span>
									<span className="flex shrink-0 items-center gap-1.5">
										<span className={`text-[13px] font-bold tabular-nums ${SIDE_STYLE[side].text}`}>{money(bal)}</span>
										<ChevronRight className="h-3.5 w-3.5 text-muted" />
									</span>
								</span>
								<span className="mt-2.5 flex items-center gap-2">
									<span className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
										<span className={`block h-full rounded-full ${SIDE_STYLE[side].bar}`} style={{ width: `${pr.pct}%` }} />
									</span>
									<span className="text-2xs tabular-nums text-muted">{Math.round(pr.pct)}% repaid</span>
								</span>
							</button>
						);
					})}
				</motion.div>*/}

				{active.length === 0 && settled.length === 0 && (
					<p className="py-10 text-center text-sm text-muted">Nobody matches that.</p>
				)}

				{settled.length > 0 && (
					<>
						<h2 className="mb-1 mt-8 px-1 text-2xs font-semibold uppercase tracking-wider text-muted">Settled</h2>
						<div className="divide-y divide-border">
							{settled.map(({ p }) => (
								<button
									key={p.id}
									type="button"
									onClick={() => setSelected({ person: p, side })}
									className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
								>
									<span className="truncate text-[13px] font-medium text-muted">{p.name}</span>
									<ChevronRight className="h-3.5 w-3.5 text-muted/60" />
								</button>
							))}
						</div>
					</>
				)}
			</div>

			<AnimatePresence>
				{selected && (
					<PersonDetail
						key={selected.person.id}
						person={selected.person}
						initial_side={selected.side}
						onBack={() => setSelected(null)}
					/>
				)}
			</AnimatePresence>
		</>
	);
}

/* ───────────── detail screen ───────────── */

type Filter = "ALL" | "THEY_OWE" | "YOU_OWE";

const FILTER_TYPES: Record<Filter, EventType[] | null> = {
	ALL: null,
	THEY_OWE: ["GIVE_LOAN", "RECEIVE_REPAYMENT"],
	YOU_OWE: ["BORROW", "REPAY_LOAN"],
};

const TITLES: Record<EventType, { title: string; inflow: boolean }> = {
	GIVE_LOAN: { title: "You lent", inflow: false },
	BORROW: { title: "You borrowed", inflow: true },
	REPAY_LOAN: { title: "You repaid", inflow: false },
	RECEIVE_REPAYMENT: { title: "They repaid", inflow: true },
};

function PersonDetail({
	person,
	initial_side,
	onBack,
}: {
	person: Person;
	initial_side: Side;
	onBack: () => void;
}) {
	const money = useMoney();
	const [filter, setFilter] = useState<Filter>(initial_side === "owed" ? "THEY_OWE" : "YOU_OWE");
	const [open_id, setOpenId] = useState<string | null>(null);

	const bal = balances(person);
	const parts: string[] = [];
	if (bal.owed > 0) parts.push(`They owe you ${money(bal.owed)}`);
	if (bal.owe > 0) parts.push(`You owe them ${money(bal.owe)}`);

	const groups = useMemo(() => {
		const types = FILTER_TYPES[filter];
		const events = person.events
			.filter((e) => !types || types.includes(e.type))
			.sort((a, b) => b.date.localeCompare(a.date));

		const buckets = new Map<string, LoanEvent[]>();
		events.forEach((e) => {
			const label = dayLabel(e.date);
			buckets.set(label, [...(buckets.get(label) ?? []), e]);
		});
		return Array.from(buckets, ([label, entries]) => ({ label, entries }));
	}, [person, filter]);

	return (
		<motion.div
			initial={{ x: "100%" }}
			animate={{ x: 0 }}
			exit={{ x: "100%" }}
			transition={{ duration: 0.25, ease: "easeOut" }}
			className="fixed inset-0 z-50 overflow-y-auto bg-background"
		>
			<div className="mx-auto max-w-md px-5 pb-16">
				<header className="flex items-center gap-3 pt-6">
					<button
						type="button"
						aria-label="Back"
						onClick={onBack}
						className="-ml-1 p-1 text-muted transition-colors hover:text-foreground"
					>
						<ArrowLeft className="h-5 w-5" />
					</button>
					<div className="min-w-0">
						<h1 className="truncate text-lg font-bold tracking-tight text-foreground">{person.name}</h1>
						<p className="text-2xs text-muted">{parts.length ? parts.join(" · ") : "All settled"}</p>
					</div>
				</header>

				<div className="mt-5">
					<Segmented<Filter>
						id="loans-filter"
						value={filter}
						onChange={setFilter}
						options={[
							{ value: "ALL", label: "All", text: "text-foreground" },
							{ value: "THEY_OWE", label: "They owe you", text: "text-receive-repayment" },
							{ value: "YOU_OWE", label: "You owe them", text: "text-repay-loan" },
						]}
					/>
				</div>

				<div className="mt-6 space-y-6">
					{groups.length === 0 && <p className="py-10 text-center text-sm text-muted">Nothing here yet.</p>}

					{groups.map((g) => (
						<div key={g.label} className="space-y-1">
							<h2 className="mb-2 px-1 text-2xs font-semibold uppercase tracking-wider text-muted">{g.label}</h2>
							<div className="divide-y divide-border">
								{g.entries.map((e) => {
									const meta = Constants.TRANSACTION_TYPE_META[e.type];
									const Icon = meta.icon;
									const t = TITLES[e.type];
									const open = open_id === e.id;
									return (
										<div key={e.id}>
											<button
												type="button"
												onClick={() => setOpenId(open ? null : e.id)}
												className="flex w-full items-center justify-between gap-3 py-3 text-left"
											>
												<span className="flex min-w-0 items-center gap-2">
													<span
														className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${meta.bg} ${meta.text}`}
													>
														<Icon className="h-5 w-5" />
													</span>
													<span className="min-w-0">
														<span className="block text-[12px] font-medium leading-tight text-foreground">{e.description}</span>
														<span className="mt-1 block truncate text-2xs text-muted">
															{DateTime.fromISO(e.date, { zone: "utc" }).setZone(TIMEZONE).toFormat("h:mm a")}
															{` • ${t.title}`}
														</span>
													</span>
												</span>
												<span
													className={`shrink-0 text-[13px] font-semibold tabular-nums ${
														t.inflow ? "text-income" : "text-expense"
													}`}
												>
													{t.inflow ? "+" : "-"}
													{money(e.amount)}
												</span>
											</button>

											{open && (
												<div className="mb-3 space-y-1.5 rounded-xl border border-border bg-surface px-3.5 py-3 text-2xs">
													{e.breakdown.map((b) => (
														<div key={b.account} className="flex justify-between">
															<span className="text-muted">{t.inflow ? "Into" : "From"} {b.account}</span>
															<span className="tabular-nums text-foreground">{money(b.amount)}</span>
														</div>
													))}
													{e.fee > 0 && (
														<div className="flex justify-between border-t border-border pt-1.5">
															<span className="text-muted">Fee</span>
															<span className="tabular-nums text-foreground">{money(e.fee)}</span>
														</div>
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}