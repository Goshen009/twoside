import { useTransactionsStore, type TransactionEntry } from "@/stores/useTransactionsStore";
import { useScrolledPast } from "@/hooks/useScrolledPast";
import { useUserStore } from "@/stores/useUserStore";
import { useIsInView } from "@/hooks/useIsInView";

import { TransactionSkeletonList } from "./componenets/TransactionSkeletonList";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { StickyAccountPill } from "./componenets/StickyAccountPill";
import { TransactionGroup } from "./componenets/TransactionGroup";
import { AccountBalanceCard } from "./AccountBalanceCard";
import { HomeHeader } from "./componenets/HomeHeader";

import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
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
	const [selected_entry, setSelectedEntry] = useState<TransactionEntry | null>(null);

	const currency_symbol = useUserStore((state) => state.data?.currency_symbol);
	const iana_timezone = useUserStore((state) => state.data?.iana_timezone);
	const load_more = useTransactionsStore((state) => state.load_more);
	const accounts = useUserStore((state) => state.data?.accounts);
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

	const { ref: balance_sentinel_ref, is_in_view } = useIsInView<HTMLDivElement>();
	const scrolled_past_threshold = useScrolledPast(400);
	
	const account_name = selected_account_id === null
    ? "All Accounts"
    : accounts?.find((a) => a.id === selected_account_id)?.name ?? "";

	const can_load_more = !!window?.has_next && !window?.loading_more && !window?.load_more_error;

	const handleLoadMore = useCallback(() => {
  	load_more({ account_id: selected_account_id, category_id: null });
	}, [load_more, selected_account_id]);
	
	const sentinel_ref = useInfiniteScroll(handleLoadMore, can_load_more);
	
	const groups = group_by_date(window?.entries ?? [], iana_timezone ?? "Africa/Lagos")

  return (
    <div className="min-h-screen pb-28">
      <div className="px-5">
        <HomeHeader/>
      </div>

      <div className="px-5 space-y-5">
        <AccountBalanceCard onAccountChange={setSelectedAccountId} />
        <div ref={balance_sentinel_ref} />

        <section aria-label="Recent Transactions" className="space-y-6">
          {window?.is_fetching && (window?.entries.length ?? 0) === 0 ? (
            <TransactionSkeletonList />
          ) : window?.error ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted">{window.error}</p>
              <button
                type="button"
                onClick={() => fetch({ account_id: selected_account_id, category_id: null })}
                className="text-sm font-semibold text-primary hover:underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : window && groups.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No transactions found. Add some
            </p>
          ) : (
         		<>
              {groups.map((group) => (
                <TransactionGroup
                  key={group.label}
                  label={group.label}
                  entries={group.entries}
                  currency_symbol={currency_symbol ?? "₦"}
                  onEntryClick={setSelectedEntry}
                />
              ))}
              {window && groups.length > 0 && (
                <div ref={sentinel_ref} className="py-4 flex items-center justify-center">
                  {window.loading_more && <Loader2 className="w-5 h-5 text-muted animate-spin" />}
                  {window.load_more_error && !window.loading_more && (
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted">Little error while loading more.</p>
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <TransactionDetailsModal
          entry={selected_entry}
          currency_symbol={currency_symbol ?? "₦"}
          timezone={iana_timezone ?? "Africa/Lagos"}
          onClose={() => setSelectedEntry(null)}
        />

        <StickyAccountPill visible={!is_in_view} account_name={account_name} />
        <ScrollToTopButton visible={scrolled_past_threshold} />
      </div>
    </div>
  );
}