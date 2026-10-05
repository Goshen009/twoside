import { useRef, useState, type SubmitEvent, type ReactNode } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore, type TransactionLogType } from "@/stores/useTransactionsStore";
import { Endpoints, type LogPayloadByType } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { type CSSProperties } from "react";
import { FormAccentContext } from "@/hooks/useFormAccent";
import Constants from "@/lib/Constants";

interface TransactionFormShellProps<T extends TransactionLogType> {
	log_type: T;
	payload: LogPayloadByType[T];
	touched_account_ids: string[];
	title: string;
	hint?: string | null;
	submit_label: string;
	can_submit: boolean;
	children: ReactNode;
}

interface Warning {
	code: string;
	message: string;
	sent: string[]; // bypass list of the attempt that raised it
	key: string;    // payload the warning was raised for
}

export function TransactionFormShell<T extends TransactionLogType>({
	log_type,
	payload,
	touched_account_ids,
	title,
	hint,
	submit_label,
	can_submit,
	children,
}: TransactionFormShellProps<T>) {
	const back = useAddTransactionStore((s) => s.back);
	const meta = Constants.TRANSACTION_TYPE_META[log_type];
	const Icon = meta.icon;

	const [is_submitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [warning, setWarning] = useState<Warning | null>(null);
	const in_flight = useRef(false);

	// a warning only counts while the payload is unchanged
	const payload_key = JSON.stringify(payload);
	const visible_warning = warning && warning.key === payload_key ? warning : null;

	const accent = Constants.TRANSACTION_TYPE_META[log_type].accent_colour;

	async function submit(bypass: string[]) {
		if (in_flight.current) return;
		in_flight.current = true;
		setIsSubmitting(true);
		setError(null);
		setWarning(null);

		try {
			await Endpoints.log(log_type, payload, bypass);
		} catch (err) {
			const w = ApiError.getWarning(err);
			if (w) setWarning({ ...w, sent: bypass, key: payload_key });
			else setError(ApiError.getErrorMessage(err));
			return;
		} finally {
			in_flight.current = false;
			setIsSubmitting(false);
		}

		useAddTransactionStore.getState().close();
		useUserStore.getState().refetch();
		useTransactionsStore.getState().invalidate(touched_account_ids);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!can_submit || is_submitting) return;
		if (visible_warning) submit([...visible_warning.sent, visible_warning.code]);
		else submit([]);
	}

	return (
		<FormAccentContext.Provider value={accent}>
			<div className="flex min-h-0 flex-1 flex-col" style={{ "--form-accent": accent } as CSSProperties}>
				<header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2">
					<div className="flex items-center gap-2.5">
						<button type="button" aria-label="Back" onClick={back} className="-ml-1 p-1 text-muted transition-colors hover:text-foreground">
							<ArrowLeft className="h-4 w-4" />
						</button>
						<div className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.text}`}>
							<Icon className="h-4 w-4" />
						</div>
						<h2 className="text-md font-semibold tracking-tight text-foreground">{title}</h2>
					</div>
				</header>
	
				<form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
					<div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4 pt-3.5">{children}</div>
	
					<div className="shrink-0 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
						{hint && (
							<p className="mb-2 text-center text-xs font-medium text-muted">{hint}</p>
						)}
						
						{error && (
							<p role="alert" className="mb-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
								{error}
							</p>
						)}
	
						{visible_warning && (
							<p className="mb-2 whitespace-pre-line rounded-xl border border-give-loan/30 bg-give-loan/10 px-3 py-2 text-xs font-medium text-give-loan">
								{visible_warning.message}
							</p>
						)}
	
						<button
							type="submit"
							disabled={!can_submit || is_submitting}
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-(--form-accent) py-3.5 text-sm font-bold text-background shadow-lg shadow-(color:--form-accent)/30 transition-all active:scale-[0.98] disabled:opacity-40"
						>
							{is_submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
							{visible_warning ? `${submit_label} Anyway` : submit_label}
						</button>
					</div>
				</form>
			</div>
		</FormAccentContext.Provider>
	);
}