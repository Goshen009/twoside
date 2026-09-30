import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { TransactionFormShell } from "../components/TransactionFormShell";
import { DescriptionField } from "../components/fields/DescriptionField";
import { DateTimeField } from "../components/fields/DateTimeField";
import { PersonField } from "../components/fields/PersonField";
import { AccountSplitSection } from "../components/AccountSplitSection";
import type { AccountSplit } from "../components/AccountSplitRow";
import { TotalSummary } from "../components/fields/TotalSummary";
import TransactionPayload from "@/lib/TransactionPayload";
import Money from "@/lib/Money";

export function GiveLoanForm() {
  const currency_symbol = useUserStore((s) => s.data?.currency_symbol) ?? "₦";
  const timezone = useUserStore((s) => s.data?.iana_timezone) ?? "Africa/Lagos";

  const [description, setDescription] = useState("");
  const [date_iso, setDateIso] = useState(() => new Date().toISOString());
  const [person, setPerson] = useState<string | null>(null);
  const [splits, setSplits] = useState<AccountSplit[]>(() => [
    { id: Math.random().toString(36).slice(2), account_id: "", amount: "", fee: "" },
  ]);

  const total = Money.sum(splits.flatMap((s) => [Money.parse(s.amount), Money.parse(s.fee)]));
  const can_submit =
    description.trim().length > 0 &&
    person !== null &&
    splits.every((s) => s.account_id && Money.parse(s.amount) > 0);

  const sources = TransactionPayload.toAllocations(splits);

  return (
    <TransactionFormShell
      log_type="GIVE_LOAN"
      payload={{ description: description.trim(), transaction_date: date_iso, counterparty_name: person ?? "", sources }}
      touched_account_ids={sources.map((s) => s.account_id)}
      title="Give Loan"
      submit_label="Save Loan"
      can_submit={can_submit}
    >
      <DescriptionField value={description} onChange={setDescription} />
      <DateTimeField value={date_iso} timezone={timezone} onChange={setDateIso} />
      <PersonField label="Lent To" value={person} onChange={setPerson} />
      <AccountSplitSection label="Paid From" splits={splits} onChange={setSplits} currency_symbol={currency_symbol} />
      <TotalSummary total={total} currency_symbol={currency_symbol} />
    </TransactionFormShell>
  );
}