import { type SubmitEvent, type ReactNode, useState } from "react";
import { Endpoints, type LogPayloadByType } from "@/api/endpoints";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import type { TransactionLogType } from "@/stores/useTransactionsStore";
import Constants from "@/lib/Constants";

interface TransactionFormShellProps<T extends TransactionLogType> {
	log_type: T;
	payload: LogPayloadByType[T];
	touched_account_ids: string[];
	title: string;
	submit_label: string;
	can_submit: boolean;
	children: ReactNode;
}

export function TransactionFormShell<T extends TransactionLogType>({ log_type, payload, touched_account_ids, title, submit_label, can_submit, children }: TransactionFormShellProps<T>) {
  const back = useAddTransactionStore((s) => s.back);
  
  const [is_submitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bypassed_warnings, setBypassedWarnings] = useState<string[]>([]);
  
  const [warning, setWarning] = useState<{ code: string; message: string; sent: string[]; key: string } | null>(null);

  
  const in_flight = useRef(false);

  const meta = Constants.TRANSACTION_TYPE_META[log_type];
  const Icon = meta.icon;

  const submit = async () => {
  	setIsSubmitting(true);
   	setError(null);
    setWarning(null);

    try {
    	Endpoints.log(log_type, payload, bypassed_warnings);
    } catch (err) {
    
    }
  };

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (can_submit && !is_submitting) onSubmit();
  }

  return (
    <>
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
          {error && (
            <p role="alert" className="mb-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
              {error}
            </p>
          )}
          <button type="submit" disabled={!can_submit || is_submitting} className="...unchanged...">
            {is_submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
            {submit_label}
          </button>
        </div>
      </form>
    </>
  );
}