import { HomeHeader } from "./componenets/HomeHeader";
import { AccountBalanceCard } from "./componenets/AccountBalanceCard";
import { TransactionGroup } from "./componenets/TransactionGroup";
import type { TransactionEntry } from "@/stores/useTransactionsStore";
import { useState } from "react";

const dummy_entries: TransactionEntry[] = [
  {
  	entry_id: "entry-1",
    account_id: "acc-1",
    account_name: "Opay",
    is_active: true,
    side: "CREDIT",
    amount: 12450,
    charge_amount: null,
    log_type: "EXPENSE",
    transaction_date: "2026-09-23T14:15:00Z",
    date_logged: "2026-09-23T14:15:00Z",
    description: "Supermarket Groceries",
    category_id: "cat-1",
    category_name: "Groceries",
    is_category_active: true,
    transaction_group_id: "tg-1",
  },
  {
  	entry_id: "entry-2",
    account_id: "acc-1",
    account_name: "Opay",
    is_active: true,
    side: "DEBIT",
    amount: 350000,
    charge_amount: null,
    log_type: "INCOME",
    transaction_date: "2026-09-23T10:30:00Z",
    date_logged: "2026-09-23T10:30:00Z",
    description: "Design Retainer Payout",
    category_id: null,
    category_name: null,
    is_category_active: null,
    transaction_group_id: "tg-2",
  },
  {
  	entry_id: "entry-3",
    account_id: "acc-1",
    account_name: "Opay",
    is_active: true,
    side: "CREDIT",
    amount: 50000,
    charge_amount: null,
    log_type: "TRANSFER",
    transaction_date: "2026-09-23T08:47:00Z",
    date_logged: "2026-09-23T08:47:00Z",
    description: "Transfer to Kuda Bank",
    category_id: null,
    category_name: null,
    is_category_active: null,
    transaction_group_id: "tg-3",
    related_account: { id: "acc-4", name: "Kuda Bank" },
  },
  {
  	entry_id: "entry-4",
    account_id: "acc-1",
    account_name: "Opay",
    is_active: true,
    side: "CREDIT",
    amount: 80000,
    charge_amount: null,
    log_type: "GIVE_LOAN",
    transaction_date: "2026-09-22T16:20:00Z",
    date_logged: "2026-09-22T16:20:00Z",
    description: "Loan to Tunde Adeleke for some reandom items and here's just some more for good measure",
    category_id: null,
    category_name: null,
    is_category_active: null,
    transaction_group_id: "tg-4",
    related_counterparty: { id: "cp-1", name: "Tunde Adeleke" },
  },
  {
  	entry_id: "entry-5",
    account_id: "acc-1",
    account_name: "Opay",
    is_active: true,
    side: "DEBIT",
    amount: 150000,
    charge_amount: null,
    log_type: "BORROW",
    transaction_date: "2026-09-22T11:15:00Z",
    date_logged: "2026-09-22T11:15:00Z",
    description: "Loan from QuickCredit",
    category_id: null,
    category_name: null,
    is_category_active: null,
    transaction_group_id: "tg-5",
    related_counterparty: { id: "cp-2", name: "QuickCredit" },
  },
];

function groupByDate(entries: TransactionEntry[]): { label: string; entries: TransactionEntry[] }[] {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const buckets = new Map<string, TransactionEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.transaction_date);
    const key =
      date.toDateString() === today
        ? "Today"
        : date.toDateString() === yesterday
          ? "Yesterday"
          : date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    buckets.set(key, [...(buckets.get(key) ?? []), entry]);
  }
  return Array.from(buckets, ([label, entries]) => ({ label, entries }));
}

export function HomePage() {
	const [active_index, setActiveIndex] = useState(0);
	
  const groups = groupByDate(dummy_entries);

  return (
    <div className="app-container min-h-screen pb-28">
      <div className="px-5">
        <HomeHeader/>
      </div>

      <div className="px-5 space-y-5">
        <AccountBalanceCard active_index={active_index} onIndexChange={setActiveIndex} />

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