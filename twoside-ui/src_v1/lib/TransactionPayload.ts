import type { AccountSplit } from "@/pages/Transactions/components/AccountSplitRow";
import type { AccountAllocation } from "@/api/endpoints";

import Money from "@/lib/Money";

class TransactionPayload {
	static toAllocations(splits: AccountSplit[]): AccountAllocation[] {
		return splits.map((s) => ({
			account_id: s.account_id,
			amount: Money.parse(s.amount),
			charge: Money.parse(s.fee),
		}));
	}
}

export default TransactionPayload;