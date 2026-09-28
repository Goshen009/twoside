import type { SubmitEvent, ReactNode } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import type { TransactionLogType } from "@/stores/useTransactionsStore";
import Constants from "@/lib/Constants";

interface TransactionFormShellProps {
  log_type: TransactionLogType;
  title: string;
  submit_label: string;
  can_submit: boolean;
  is_submitting?: boolean;
  onSubmit: () => void;
  children: ReactNode;
}

export function TransactionFormShell({ log_type, title, submit_label, can_submit, is_submitting = false, onSubmit, children }: TransactionFormShellProps) {
  const back = useAddTransactionStore((s) => s.back);
  const meta = Constants.TRANSACTION_TYPE_META[log_type];
  const Icon = meta.icon;

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
          <button
            type="submit"
            disabled={!can_submit || is_submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            {submit_label}
          </button>
        </div>
      </form>
    </>
  );
}