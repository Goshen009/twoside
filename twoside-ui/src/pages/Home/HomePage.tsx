import { useTransactionsStore, type TransactionEntry } from "@/stores/useTransactionsStore";
import { useUserStore } from "@/stores/useUserStore";

import { AccountBalanceCard } from "./componenets/AccountBalanceCard";
import { TransactionGroup } from "./componenets/TransactionGroup";
import { HomeHeader } from "./componenets/HomeHeader";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";

const group_by_date = (entries: TransactionEntry[], timezone: string): { label: string; entries: TransactionEntry[] }[] => {
	const get_label = (iso: string, timezone: string): string => {
		const dt = DateTime.fromISO(iso, { zone: 'utc' }).setZone(timezone);
		const now = DateTime.now().setZone(timezone);

		if (dt.hasSame(now, 'day')) return 'Today';
		if (dt.hasSame(now.minus({ days: 1 }), 'day')) return 'Yesterday';
		return dt.toFormat("MMMM d, yyyy");
	};
	
	const buckets = new Map<string, TransactionEntry[]>();
	entries.forEach(e => {
		const label = get_label(e.transaction_date, timezone);
		buckets.set(label, [...(buckets.get(label) ?? []), e]);
	});
	return Array.from(buckets, ([label, entries]) => ({ label, entries }));
}

export function HomePage() {
	const [selected_account_id, setSelectedAccountId] = useState<string | null>(null);
	
	const iana_timezone = useUserStore((state) => state.data?.iana_timezone);
	const fetch = useTransactionsStore((state) => state.fetch);

	useEffect(() => {
		const key_filters = { account_id: selected_account_id, category_id: null };
	  const existing = useTransactionsStore.getState().get_window(key_filters);
	  if (existing && !existing.error) return; // cache hit, skip
	  fetch(key_filters);
  }, [selected_account_id, fetch]);

	const window = useTransactionsStore((state) => state.get_window({
		account_id: selected_account_id,
		category_id: null
	}));
	
	const groups = group_by_date(window?.entries ?? [], iana_timezone ?? "Africa/Lagos")

  return (
    <div className="app-container min-h-screen pb-28">
      <div className="px-5">
        <HomeHeader/>
      </div>

      <div className="px-5 space-y-5">
        <AccountBalanceCard onAccountChange={setSelectedAccountId} />

        <section aria-label="Recent Transactions" className="space-y-6">
          {groups.map((group) => (
            <TransactionGroup
              key={group.label}
              label={group.label}
              entries={group.entries}
              currency_symbol="₦"
            />
          ))}
        </section>
      </div>
    </div>
  );
}