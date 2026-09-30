import { useState } from "react";
import { Check, ListFilter } from "lucide-react";
import type { TransactionLogType } from "@/stores/useTransactionsStore";
import Constants from "@/lib/Constants";
import { Sheet } from "@/pages/Transactions/components/Sheet";

const TYPES: TransactionLogType[] = [
	"EXPENSE", "INCOME", "TRANSFER", "GIVE_LOAN", "BORROW", "REPAY_LOAN", "RECEIVE_REPAYMENT",
];

interface TypeFilterProps {
	value: TransactionLogType[];
	onChange: (types: TransactionLogType[]) => void;
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
	const [open, setOpen] = useState(false);
	const active = value.length > 0;

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-2xs font-semibold transition-colors ${
					active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface text-muted"
				}`}
			>
				<ListFilter className="h-3 w-3" />
				{active ? `${value.length} type${value.length > 1 ? "s" : ""}` : "Filter"}
			</button>

			<Sheet open={open} onClose={() => setOpen(false)} title="Filter by Type">
				{/* mounted only while open, so the draft resets on every open */}
				<TypeFilterBody value={value} onApply={(t) => { onChange(t); setOpen(false); }} />
			</Sheet>
		</>
	);
}

function TypeFilterBody({ value, onApply }: { value: TransactionLogType[]; onApply: (t: TransactionLogType[]) => void }) {
	const [draft, setDraft] = useState<TransactionLogType[]>(value);

	const toggle = (t: TransactionLogType) =>
		setDraft((d) => (d.includes(t) ? d.filter((x) => x !== t) : [...d, t]));

	return (
		<div className="space-y-2">
			{TYPES.map((t) => {
				const meta = Constants.TRANSACTION_TYPE_META[t];
				const Icon = meta.icon;
				const on = draft.includes(t);
				return (
					<button
						type="button"
						key={t}
						onClick={() => toggle(t)}
						className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
							on ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:bg-surface-hover"
						}`}
					>
						<span className="flex items-center gap-2.5">
							<span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.text}`}>
								<Icon className="h-4 w-4" />
							</span>
							<span className="text-xs font-semibold text-foreground">{meta.label}</span>
						</span>
						<span className={`flex h-5 w-5 items-center justify-center rounded-full border ${on ? "border-transparent bg-primary" : "border-border"}`}>
							{on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
						</span>
					</button>
				);
			})}

			<div className="flex gap-2 pt-2">
				<button
					type="button"
					onClick={() => setDraft([])}
					className="flex-1 rounded-xl border border-border py-3 text-xs font-semibold text-muted transition-colors hover:bg-surface-hover"
				>
					Clear
				</button>
				<button
					type="button"
					onClick={() => onApply([...draft].sort())}
					className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-background"
				>
					Apply
				</button>
			</div>
		</div>
	);
}