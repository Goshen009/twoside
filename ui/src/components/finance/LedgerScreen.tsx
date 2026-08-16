import { useState } from 'react';
import { CalendarDays, ChevronDown, CircleAlert } from 'lucide-react';
import { Selector } from '../shared/Selector';
import { PickerSheet } from './PickerSheet';
import { useAccounts } from '../../hooks/useAccounts';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDate } from '../../lib/format';
import { WalletCards } from 'lucide-react';

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
      <span className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-3.5 size-4 text-primary" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-2xl border border-primary/25 bg-accent/30 pl-9 pr-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </span>
    </label>
  );
}

function BalanceCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className={`mt-2 text-base font-semibold tabular-nums ${accent ? 'text-primary' : ''}`}>{value.toFixed(2)}</p>
    </div>
  );
}

export function LedgerScreen() {
  const { accounts } = useAccounts();
  const { data, loading, error, fetch } = useTransactions();

  const [accountId, setAccountId] = useState('');
  const [start, setStart] = useState('2026-08-01');
  const [end, setEnd] = useState('2026-08-15');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const accountName = accounts.find((a) => a.id === accountId)?.name ?? '';

  const handleView = async () => {
    if (!accountId) return;
    await fetch(accountId, start, end);
    setHasViewed(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <main className="mx-auto w-full max-w-lg px-4 pb-6 pt-4">
        {hasViewed ? (
          <button
            type="button"
            onClick={() => setHasViewed(false)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <WalletCards className="size-4 shrink-0 text-primary" />
              <span className="truncate text-sm font-medium">{accountName}</span>
              <span className="text-xs text-muted-foreground">{start.slice(5)} – {end.slice(5)}</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ) : (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              <Selector
                value={accountName || undefined}
                placeholder="Choose account"
                icon={WalletCards}
                onClick={() => setPickerOpen(true)}
              />
              <div className="grid grid-cols-2 gap-3">
                <DateField label="From" value={start} onChange={setStart} />
                <DateField label="To" value={end} onChange={setEnd} />
              </div>
              <button
                type="button"
                onClick={handleView}
                disabled={!accountId || loading}
                className="flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'View ledger'}
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </section>
        )}

        {hasViewed && data && (
          <>
            <section className="mt-4 grid grid-cols-2 gap-3">
              <BalanceCard label="Opening balance" value={data.opening_balance ?? 0} />
              <BalanceCard label="Closing balance" value={data.closing_balance ?? 0} accent />
            </section>

            {data.is_account_disabled && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-xs text-muted-foreground">
                <CircleAlert className="size-4 shrink-0" />
                This account is disabled for new entries.
              </div>
            )}

            <section className="mt-5">
              <h2 className="mb-3 font-medium">Transactions</h2>
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                {data.entries.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">No transactions in this range.</p>
                )}
                {data.entries.map((entry) => (
                  <article key={entry.id} className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.description}</p>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{formatDate(entry.trx_date)}</span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`text-sm font-semibold tabular-nums ${entry.side === 'CREDIT' ? 'text-destructive' : 'text-primary'}`}>
                        {entry.side === 'CREDIT' ? '-' : '+'}{Number(entry.amount).toFixed(2)}
                      </span>
                      {entry.category_name && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{entry.category_name}</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {pickerOpen && (
        <PickerSheet
          title="Choose account"
          items={accounts.map((a) => ({ id: a.id, label: a.name }))}
          onSelect={(id) => { setAccountId(id); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}