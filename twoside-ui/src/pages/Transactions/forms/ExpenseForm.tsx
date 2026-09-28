import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { TransactionFormShell } from "../components/TransactionFormShell";
import { DescriptionField } from "../components/fields/DescriptionField";
import { DateTimeField } from "../components/fields/DateTimeField";
import { CategoryField } from "../components/fields/CategoryField";
import { AccountSplitSection } from "../components/fields/AccountSplitSection";
import type { AccountSplit } from "../components/fields/AccountSplitRow";
import { TotalSummary } from "../components/fields/TotalSummary";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import { Endpoints } from "@/api/endpoints";
import TransactionPayload from "@/lib/TransactionPayload";

export function ExpenseForm() {
  const accounts = useUserStore((s) => s.data?.accounts);
  const currency_symbol = useUserStore((s) => s.data?.currency_symbol) ?? "₦";
  const timezone = useUserStore((s) => s.data?.iana_timezone) ?? "Africa/Lagos";
  const submit = useAddTransactionStore((s) => s.submit);
  const categories = useUserStore((s) => s.data?.categories) ?? [];

  const [description, setDescription] = useState("");
  const [date_iso, setDateIso] = useState(() => new Date().toISOString());
  const [category_id, setCategoryId] = useState<string | null>(null);
  const [splits, setSplits] = useState<AccountSplit[]>(() => [
    { id: Math.random().toString(36).slice(2), account_id: accounts?.[0]?.id ?? "", amount: "", fee: "" },
  ]);

  const total = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0) + (parseFloat(s.fee) || 0), 0);
  const can_submit =
    description.trim().length > 0 &&
    splits.every((s) => s.account_id && (parseFloat(s.amount) || 0) > 0);

  
  function handleSubmit() {
    submit(
      () => Endpoints.logExpense({
        description: description.trim(),
        transaction_date: date_iso,
        category_name: categories.find((c) => c.id === category_id)?.name ?? null,
        sources: TransactionPayload.toAllocations(splits),
      }),
      splits.map((s) => s.account_id),
    );
  }
  
  return (
    <TransactionFormShell
      log_type="EXPENSE"
      title="Log Expense"
      submit_label="Save Expense"
      can_submit={can_submit}
      onSubmit={handleSubmit}
    >
      <DescriptionField value={description} onChange={setDescription} />
      <DateTimeField value={date_iso} timezone={timezone} onChange={setDateIso} />
      <CategoryField value={category_id} onChange={setCategoryId} />
      <AccountSplitSection label="Paid From" splits={splits} onChange={setSplits} currency_symbol={currency_symbol} />
      <TotalSummary total={total} currency_symbol={currency_symbol} />
    </TransactionFormShell>
  );
}