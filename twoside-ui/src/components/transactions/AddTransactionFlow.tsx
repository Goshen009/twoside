import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useAddTransactionFlow } from "@/hooks/useAddTransactionFlow";
import { Sheet } from "@/components/ui/Sheet";
import { TypeSelectorSheet } from "@/components/transactions/TypeSelectorSheet";
import { TransactionFormView } from "@/components/transactions/TransactionFormView";

export function AddTransactionFlow() {
  const { is_open, stage, transaction_type, close, back_to_types } =
    useAddTransactionFlow();

  const title =
    stage === "form" && transaction_type
      ? TRANSACTION_TYPE_META[transaction_type].label
      : "New Transaction";

  return (
    <Sheet
      open={is_open}
      on_close={close}
      on_back={stage === "form" ? back_to_types : null}
      title={title}
    >
      {stage === "type_select" ? (
        <TypeSelectorSheet />
      ) : transaction_type ? (
        <TransactionFormView key={transaction_type} transaction_type={transaction_type} />
      ) : null}
    </Sheet>
  );
}
