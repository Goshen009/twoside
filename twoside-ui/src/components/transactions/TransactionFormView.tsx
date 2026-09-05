import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useAddTransactionFlow } from "@/hooks/useAddTransactionFlow";
import { BorrowForm } from "@/components/transactions/forms/BorrowForm";
import { ExpenseForm } from "@/components/transactions/forms/ExpenseForm";
import { GiveLoanForm } from "@/components/transactions/forms/GiveLoanForm";
import { IncomeForm } from "@/components/transactions/forms/IncomeForm";
import { TransferForm } from "@/components/transactions/forms/TransferForm";
import type { TransactionFormViewProps } from "@/types/types";

export function TransactionFormView({ transaction_type }: TransactionFormViewProps) {
  const { close } = useAddTransactionFlow();
  const meta = TRANSACTION_TYPE_META[transaction_type];

  if (transaction_type === "expense") {
    return <ExpenseForm on_success={close} />;
  }

  if (transaction_type === "income") {
    return <IncomeForm on_success={close} />;
  }

  if (transaction_type === "transfer") {
    return <TransferForm on_success={close} />;
  }

  if (transaction_type === "give_loan") {
    return <GiveLoanForm on_success={close} />;
  }

  if (transaction_type === "borrow") {
    return <BorrowForm on_success={close} />;
  }

  const Icon = meta.icon;

  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${meta.accent}1f`, color: meta.accent }}
      >
        <Icon className="h-6 w-6" />
      </span>
      <p className="max-w-[220px] text-xs leading-relaxed text-muted">
        <span className="font-medium text-foreground">{meta.label}</span> form fields
        land in a later bite.
      </p>
    </div>
  );
}
