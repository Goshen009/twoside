import { ChevronRight } from "lucide-react";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";

import type { TransactionLogType } from "@/stores/useTransactionsStore";
import Constants from "@/lib/Constants";

const OPTION_STYLES: Record<TransactionLogType, { label: string; box: string }> = {
  EXPENSE: { label: "Expense", box: "bg-expense/10 border-expense/20 text-expense" },
  INCOME: { label: "Income", box: "bg-income/10 border-income/20 text-income" },
  TRANSFER: { label: "Transfer", box: "bg-transfer/10 border-transfer/20 text-transfer" },
  GIVE_LOAN: { label: "Give Loan", box: "bg-give-loan/10 border-give-loan/20 text-give-loan" },
  BORROW: { label: "Borrow", box: "bg-borrow/10 border-borrow/20 text-borrow" },
  REPAY_LOAN: { label: "Repay Loan", box: "bg-repay-loan/10 border-repay-loan/20 text-repay-loan" },
  RECEIVE_REPAYMENT: { label: "Receive Repayment", box: "bg-receive-repayment/10 border-receive-repayment/20 text-receive-repayment" },
};

const CORE: TransactionLogType[] = ["EXPENSE", "INCOME", "TRANSFER"];
const LOANS: TransactionLogType[] = ["GIVE_LOAN", "BORROW", "REPAY_LOAN", "RECEIVE_REPAYMENT"];

function TypeOption({ type }: { type: TransactionLogType }) {
  const choose = useAddTransactionStore((s) => s.choose);
  const meta = Constants.TRANSACTION_TYPE_META[type];
  const { label, box } = OPTION_STYLES[type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => choose(type)}
      className="flex w-full items-center justify-between rounded-2xl border border-picker-border bg-picker-background p-3 text-left transition-transform active:bg-picker-surface-hover"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${box}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-semibold leading-tight text-foreground">{label}</div>
          <div className="mt-0.5 text-2xs text-muted">{meta.description}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted" />
    </button>
  );
}

export function TransactionTypePicker() {
  return (
    <>
      <header className="flex shrink-0 items-center justify-between px-6 py-3">
        <h2 className="text-md font-semibold tracking-tight text-foreground">New Transaction</h2>
      </header>

      <div className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
        {CORE.map((t) => <TypeOption key={t} type={t} />)}
        <div className="px-1 pb-1 pt-3">
          <span className="text-2xs font-semibold uppercase tracking-wider text-muted">Loans</span>
        </div>
        {LOANS.map((t) => <TypeOption key={t} type={t} />)}
      </div>
    </>
  );
}