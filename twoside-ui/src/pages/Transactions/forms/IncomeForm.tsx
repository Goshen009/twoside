import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";

import { TotalSummary } from "../components/fields/TotalSummary";
import { DateTimeField } from "../components/fields/DateTimeField";
import { DescriptionField } from "../components/fields/DescriptionField";

import type { AccountSplit } from "../components/AccountSplitRow";
import { AccountSplitSection } from "../components/AccountSplitSection";
import { TransactionFormShell } from "../components/TransactionFormShell";

import TransactionPayload from "@/lib/TransactionPayload";
import Money from "@/lib/Money";

export function IncomeForm() {
  const currency_symbol = useUserStore((s) => s.data?.currency_symbol) ?? "₦";
  const timezone = useUserStore((s) => s.data?.iana_timezone) ?? "Africa/Lagos";

  const [description, setDescription] = useState("");
  const [date_iso, setDateIso] = useState(() => new Date().toISOString());
  const [splits, setSplits] = useState<AccountSplit[]>(() => [
    { id: Math.random().toString(36).slice(2), account_id: "", amount: "", fee: "" },
  ]);

  const total = Money.sum(splits.flatMap((s) => [Money.parse(s.amount), Money.parse(s.fee)]));
  const can_submit =
    description.trim().length > 0 &&
    splits.every((s) => s.account_id && Money.parse(s.amount) > 0);

  const destinations = TransactionPayload.toAllocations(splits);

  return (
    <TransactionFormShell
      log_type="INCOME"
      payload={{ description: description.trim(), transaction_date: date_iso, destinations }}
      touched_account_ids={destinations.map((d) => d.account_id)}
      title="Log Income"
      submit_label="Save Income"
      can_submit={can_submit}
    >
      <DescriptionField value={description} onChange={setDescription} />
      <DateTimeField value={date_iso} timezone={timezone} onChange={setDateIso} />
      <AccountSplitSection label="Received Into" splits={splits} onChange={setSplits} currency_symbol={currency_symbol} />
      <TotalSummary total={total} currency_symbol={currency_symbol} />
    </TransactionFormShell>
  );
}