import { useState, useMemo } from 'react';
import { Plus, Check } from 'lucide-react';
import { TransactionLineRow, type LineState } from './TransactionLineRow';
import { PickerSheet } from './PickerSheet';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { useCounterparties } from '../../hooks/useCounterparties';
import { useLoans } from '../../hooks/useLoans';
import { useLogTransaction } from '../../hooks/useLogTransaction';
import type { LineKind, TransactionLine } from '../../lib/types';

type PickerState = { kind: 'account' | 'category' | 'counterparty' | 'loan' | 'type'; lineId: number } | null;

const kindOptions: LineKind[] = ['ACCOUNT', 'GIVE_LOAN', 'BORROW', 'RECEIVE_LOAN_REPAYMENT', 'REPAY_LOAN'];
const kindLabels: Record<LineKind, string> = {
  ACCOUNT: 'Account',
  GIVE_LOAN: 'Give loan',
  BORROW: 'Borrow money',
  RECEIVE_LOAN_REPAYMENT: 'Receive repayment',
  REPAY_LOAN: 'Repay loan',
};

function makeLine(id: number): LineState {
  return { id, kind: 'ACCOUNT', account_id: '', category_id: null, direction: 'DECREASE', amount: '', counterparty_id: '', loan_id: '' };
}

export function TransactionBuilder() {
  const { accounts } = useAccounts();
  const { categories, create: createCategory } = useCategories();
  const { counterparties, create: createCounterparty } = useCounterparties();
  const { loans, refresh: refreshLoans } = useLoans();
  const { submit, submitting, error } = useLogTransaction();

  const [description, setDescription] = useState('');
  const [trxDate, setTrxDate] = useState('');
  const [lines, setLines] = useState<LineState[]>([makeLine(1), makeLine(2)]);
  const [picker, setPicker] = useState<PickerState>(null);
  const [saved, setSaved] = useState(false);

  const updateLine = (id: number, patch: Partial<LineState>) => {
    setSaved(false);
    setLines((current) => current.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((current) => [...current, makeLine(Math.max(...current.map((l) => l.id), 0) + 1)]);
  const removeLine = (id: number) => { if (lines.length > 2) setLines((current) => current.filter((l) => l.id !== id)); };

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? '';
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';
  const counterpartyName = (id: string) => counterparties.find((c) => c.id === id)?.name ?? '';
  const loanLabel = (id: string) => {
    const loan = loans.find((l) => l.id === id);
    return loan ? `${loan.counterparty_name} — ${loan.amount}` : '';
  };

  const complete = lines.every((l) => {
    if (!l.amount || Number(l.amount) <= 0) return false;
    if (l.kind === 'ACCOUNT') return Boolean(l.account_id);
    if (l.kind === 'GIVE_LOAN' || l.kind === 'BORROW') return Boolean(l.counterparty_id);
    return Boolean(l.loan_id);
  }) && Boolean(description) && Boolean(trxDate);

  // NOTE: real balance-checking (increase/decrease resolved against account type)
  // happens server-side; this is just a UI completeness gate, not a substitute
  // for the backend's actual balance validation.

  const buildPayload = (): TransactionLine[] =>
    lines.map((l): TransactionLine => {
      if (l.kind === 'ACCOUNT') {
        return { kind: 'ACCOUNT', account_id: l.account_id, category_id: l.category_id, amount: Number(l.amount), direction: l.direction };
      }
      if (l.kind === 'GIVE_LOAN' || l.kind === 'BORROW') {
        return { kind: l.kind, amount: Number(l.amount), counterparty_id: l.counterparty_id };
      }
      return { kind: l.kind, amount: Number(l.amount), loan_id: l.loan_id };
    });

  const handleSubmit = async () => {
    try {
      await submit({ description, trx_date: new Date(trxDate).toISOString(), lines: buildPayload() });
      setSaved(true);
      await refreshLoans();
    } catch {
      // error already captured in hook state
    }
  };

  const pickerItems = useMemo(() => {
    if (!picker) return [];
    if (picker.kind === 'type') return kindOptions.map((k) => ({ id: k, label: kindLabels[k] }));
    if (picker.kind === 'account') return accounts.map((a) => ({ id: a.id, label: a.name }));
    if (picker.kind === 'category') return [{ id: '', label: 'None' }, ...categories.map((c) => ({ id: c.id, label: c.name }))];
    if (picker.kind === 'counterparty') return counterparties.map((c) => ({ id: c.id, label: c.name }));
    if (picker.kind === 'loan') {
      const activeLine = lines.find((l) => l.id === picker.lineId);
      const wantedDirection = activeLine?.kind === 'RECEIVE_LOAN_REPAYMENT' ? 'GIVEN' : 'BORROWED';
      return loans
        .filter((l) => l.direction === wantedDirection && l.status !== 'CLOSED')
        .map((l) => ({ id: l.id, label: l.counterparty_name, sublabel: `${l.amount - l.total_repaid} remaining` }));
    }
    return [];
  }, [picker, accounts, categories, counterparties, loans, lines]);

  const handlePickerSelect = (id: string) => {
    if (!picker) return;
    if (picker.kind === 'type') updateLine(picker.lineId, { kind: id as LineKind, account_id: '', category_id: null, counterparty_id: '', loan_id: '' });
    if (picker.kind === 'account') updateLine(picker.lineId, { account_id: id });
    if (picker.kind === 'category') updateLine(picker.lineId, { category_id: id || null });
    if (picker.kind === 'counterparty') updateLine(picker.lineId, { counterparty_id: id });
    if (picker.kind === 'loan') updateLine(picker.lineId, { loan_id: id });
    setPicker(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <main className="mx-auto w-full max-w-lg px-4 pb-5 pt-4">
        <div className="mb-4 flex flex-col gap-3">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="datetime-local"
            value={trxDate}
            onChange={(e) => setTrxDate(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <section className="flex flex-col gap-3">
          {lines.map((line) => (
            <TransactionLineRow
              key={line.id}
              line={line}
              accounts={accounts}
              categories={categories}
              onUpdate={updateLine}
              onRemove={removeLine}
              canRemove={lines.length > 2}
              onOpenPicker={(kind, lineId) => setPicker({ kind, lineId })}
              accountName={accountName}
              categoryName={categoryName}
              counterpartyName={counterpartyName}
              loanLabel={loanLabel}
            />
          ))}
        </section>

        <button
          type="button"
          onClick={addLine}
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-foreground"
        >
          <Plus className="size-4" /> Add another
        </button>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <button
          type="button"
          disabled={!complete || submitting}
          onClick={handleSubmit}
          className="mt-5 h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {submitting ? 'Logging...' : saved ? <span className="flex items-center justify-center gap-2"><Check className="size-4" /> Logged</span> : 'Log transaction'}
        </button>
      </main>

      {picker && (
        <PickerSheet
          title={picker.kind.charAt(0).toUpperCase() + picker.kind.slice(1)}
          items={pickerItems}
          onSelect={handlePickerSelect}
          onClose={() => setPicker(null)}
          onCreate={
            picker.kind === 'category' ? async (name) => { await createCategory(name); }
            : picker.kind === 'counterparty' ? async (name) => { await createCounterparty(name); }
            : undefined
          }
          createLabel={picker.kind === 'category' ? 'category' : picker.kind === 'counterparty' ? 'person' : undefined}
        />
      )}
    </div>
  );
}