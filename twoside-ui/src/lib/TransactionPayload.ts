import type { AccountSplit } from "@/pages/Transactions/components/fields/AccountSplitRow";
import type { AccountAllocation } from "@/api/endpoints";

class TransactionPayload {
	static toAllocations(splits: AccountSplit[]): AccountAllocation[] {
	  return splits.map((s) => ({
	    account_id: s.account_id,
	    amount: parseFloat(s.amount),
	    charge: parseFloat(s.fee) || 0,
	  }));
	}
}

export default TransactionPayload;