import { useState } from "react";
import { HandCoins } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useFormAccent } from "@/hooks/useFormAccent";

import { FormField } from "../components/fields/FormField";
import { TotalSummary } from "../components/fields/TotalSummary";
import { DateTimeField } from "../components/fields/DateTimeField";
import { PickerTrigger } from "../components/fields/PickerTrigger";
import { LoanPickerSheet } from "../components/pickers/LoanPickerSheet";
import { DescriptionField } from "../components/fields/DescriptionField";

import type { AccountSplit } from "../components/AccountSplitRow";
import { AccountSplitSection } from "../components/AccountSplitSection";
import { TransactionFormShell } from "../components/TransactionFormShell";

import TransactionPayload from "@/lib/TransactionPayload";
import Format from "@/lib/Format";
import Money from "@/lib/Money";

export function ReceiveRepaymentForm() {
  const currency_symbol = useUserStore((s) => s.data?.currency_symbol) ?? "₦";
  const timezone = useUserStore((s) => s.data?.iana_timezone) ?? "Africa/Lagos";
  const all_loans = useUserStore((s) => s.data?.open_loans);
  const loans = (all_loans ?? []).filter((l) => l.direction === "GIVEN");
  const accent = useFormAccent();

  const [description, setDescription] = useState("");
  const [date_iso, setDateIso] = useState(() => new Date().toISOString());
  const [loan_id, setLoanId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [splits, setSplits] = useState<AccountSplit[]>(() => [
    { id: Math.random().toString(36).slice(2), account_id: "", amount: "", fee: "" },
  ]);

  const loan = loans.find((l) => l.id === loan_id);
  const remaining = loan ? Money.sum([loan.amount, -loan.total_repaid]) : 0;
  const receiving = Money.sum(splits.map((s) => Money.parse(s.amount)));
  const total = Money.sum(splits.flatMap((s) => [Money.parse(s.amount), Money.parse(s.fee)]));

  const can_submit =
    description.trim().length > 0 &&
    loan_id !== null &&
    splits.every((s) => s.account_id && Money.parse(s.amount) > 0);

  const destinations = TransactionPayload.toAllocations(splits);

  let hint: string | null = null;
  if (loans.length === 0) hint = "Nobody owes you anything right now.";
  else if (loan && receiving > remaining)
    hint = `That's more than the ${Format.money(remaining, currency_symbol).full} still owed to you.`;

  return (
    <TransactionFormShell
      log_type="RECEIVE_REPAYMENT"
      payload={{ description: description.trim(), transaction_date: date_iso, loan_id: loan_id ?? "", destinations }}
      touched_account_ids={destinations.map((d) => d.account_id)}
      title="Receive Repayment"
      submit_label="Save Repayment"
      can_submit={can_submit}
      hint={hint}
    >
      <DescriptionField value={description} onChange={setDescription} />
      <DateTimeField value={date_iso} timezone={timezone} onChange={setDateIso} />
      <FormField label="Loan">
        <PickerTrigger
          icon={HandCoins}
          value={loan ? `${loan.counterparty_name} · ${Format.money(remaining, currency_symbol).full} left` : null}
          placeholder="Select a loan"
          onClick={() => setPicking(true)}
        />
        <LoanPickerSheet
          open={picking}
          onClose={() => setPicking(false)}
          title="Select Loan"
          loans={loans}
          selected_id={loan_id}
          onSelect={setLoanId}
          currency_symbol={currency_symbol}
          timezone={timezone}
          accent={accent}
          empty_message="Nobody owes you right now"
        />
      </FormField>
      <AccountSplitSection label="Received Into" splits={splits} onChange={setSplits} currency_symbol={currency_symbol} />
      <TotalSummary total={total} currency_symbol={currency_symbol} />
    </TransactionFormShell>
  );
}