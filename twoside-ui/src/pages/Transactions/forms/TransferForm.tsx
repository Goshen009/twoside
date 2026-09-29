import { useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { TransactionFormShell } from "../components/TransactionFormShell";
import { DescriptionField } from "../components/fields/DescriptionField";
import { DateTimeField } from "../components/fields/DateTimeField";
import { FormField } from "../components/fields/FormField";
import { AccountPickerRow } from "../components/fields/AccountPickerRow";
import { AmountFeeCard } from "../components/fields/AmountFeeCard";
import { TotalSummary } from "../components/fields/TotalSummary";
import Money from "@/lib/Money";

export function TransferForm() {
	const accounts = useUserStore((s) => s.data?.accounts) ?? [];
	const currency_symbol = useUserStore((s) => s.data?.currency_symbol) ?? "₦";
	const timezone = useUserStore((s) => s.data?.iana_timezone) ?? "Africa/Lagos";

	const [description, setDescription] = useState("");
	const [date_iso, setDateIso] = useState(() => new Date().toISOString());
	const [from_id, setFromId] = useState(accounts[0]?.id ?? "");
	const [to_id, setToId] = useState(accounts[1]?.id ?? "");
	const [amount, setAmount] = useState("");
	const [fee, setFee] = useState("");

	const from_account = accounts.find((a) => a.id === from_id);
	const total = Money.sum([Money.parse(amount), Money.parse(fee)]);

	const can_submit =
		description.trim().length > 0 &&
		from_id !== "" &&
		to_id !== "" &&
		from_id !== to_id &&
		Money.parse(amount) > 0;

	return (
		<TransactionFormShell
			log_type="TRANSFER"
			payload={{
				description: description.trim(),
				transaction_date: date_iso,
				amount: Money.parse(amount),
				charge: Money.parse(fee),
				from_account_id: from_id,
				to_account_id: to_id,
			}}
			touched_account_ids={[from_id, to_id]}
			title="Log Transfer"
			submit_label="Save Transfer"
			can_submit={can_submit}
		>
			<DescriptionField value={description} onChange={setDescription} />
			<DateTimeField value={date_iso} timezone={timezone} onChange={setDateIso} />
			<FormField label="Transfer Accounts">
				<div className="space-y-2">
					<AccountPickerRow
						tag="From"
						value={from_id}
						accounts={accounts}
						disabled_id={from_id}
						currency_symbol={currency_symbol}
						onChange={setFromId}
					/>
					<AccountPickerRow
						tag="To"
						value={to_id}
						accounts={accounts}
						disabled_id={to_id}
						currency_symbol={currency_symbol}
						onChange={setToId}
					/>
					<AmountFeeCard
						amount={amount}
						fee={fee}
						max={from_account?.balance}
						currency_symbol={currency_symbol}
						onAmountChange={setAmount}
						onFeeChange={setFee}
					/>
				</div>
			</FormField>
			<TotalSummary total={total} currency_symbol={currency_symbol} />
		</TransactionFormShell>
	);
}