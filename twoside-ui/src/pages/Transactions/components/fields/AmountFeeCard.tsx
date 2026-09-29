import { FIELD_LABEL } from "./FormField";
import { MoneyInput } from "./MoneyInput";
import Format from "@/lib/Format";

interface AmountFeeCardProps {
	amount: string;
	fee: string;
	max?: number;
	currency_symbol: string;
	onAmountChange: (v: string) => void;
	onFeeChange: (v: string) => void;
}

export function AmountFeeCard({ amount, fee, max, currency_symbol, onAmountChange, onFeeChange }: AmountFeeCardProps) {
	return (
		<div className="space-y-2.5 rounded-xl border border-border bg-surface p-2.5">
			<div>
				<div className="mb-1 flex items-center justify-between">
					<span className={FIELD_LABEL}>Amount</span>
					{max !== undefined && (
						<span className="text-2xs tabular-nums text-muted">Max: {Format.money(max, currency_symbol).full}</span>
					)}
				</div>
				<MoneyInput size="lg" value={amount} onChange={onAmountChange} currency_symbol={currency_symbol} />
			</div>
			<div className="border-t border-border pt-1.5">
				<span className={`mb-1 block ${FIELD_LABEL}`}>Fee (Optional)</span>
				<MoneyInput size="sm" value={fee} onChange={onFeeChange} currency_symbol={currency_symbol} />
			</div>
		</div>
	);
}