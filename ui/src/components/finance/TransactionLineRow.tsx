import { Trash2 } from 'lucide-react';
import { Selector } from '../shared/Selector';
import { WalletCards, Users, Banknote, ArrowUp, ArrowDown } from 'lucide-react';
import type { Account, Category, LineKind } from '../../lib/types';

export interface LineState {
  id: number;
  kind: LineKind;
  account_id: string;
  category_id: string | null;
  direction: 'INCREASE' | 'DECREASE';
  amount: string;
  counterparty_id: string;
  loan_id: string;
}

interface Props {
  line: LineState;
  accounts: Account[];
  categories: Category[];
  onUpdate: (id: number, patch: Partial<LineState>) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
  onOpenPicker: (kind: 'account' | 'category' | 'counterparty' | 'loan' | 'type', lineId: number) => void;
  accountName: (id: string) => string;
  categoryName: (id: string) => string;
  counterpartyName: (id: string) => string;
  loanLabel: (id: string) => string;
}

const kindLabels: Record<LineKind, string> = {
  ACCOUNT: 'Account',
  GIVE_LOAN: 'Give loan',
  BORROW: 'Borrow money',
  RECEIVE_LOAN_REPAYMENT: 'Receive repayment',
  REPAY_LOAN: 'Repay loan',
};

export function TransactionLineRow({
  line, accounts, onUpdate, onRemove, canRemove, onOpenPicker,
  accountName, categoryName, counterpartyName, loanLabel,
}: Props) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Selector
            value={kindLabels[line.kind]}
            placeholder="Choose type"
            icon={WalletCards}
            onClick={() => onOpenPicker('type', line.id)}
          />
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(line.id)}
            aria-label="Remove entry"
            className="shrink-0 rounded-xl p-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Amount</span>
          <input
            value={line.amount}
            onChange={(e) => onUpdate(line.id, { amount: e.target.value.replace(/[^0-9.]/g, '') })}
            inputMode="decimal"
            placeholder="0.00"
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </label>

        {line.kind === 'ACCOUNT' && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Flow</span>
            <div className="grid h-11 grid-cols-2 rounded-xl border border-border bg-secondary/60 p-1">
              <button
                type="button"
                aria-label="Increase"
                onClick={() => onUpdate(line.id, { direction: 'INCREASE' })}
                className={`flex items-center justify-center rounded-lg transition ${line.direction === 'INCREASE' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Decrease"
                onClick={() => onUpdate(line.id, { direction: 'DECREASE' })}
                className={`flex items-center justify-center rounded-lg transition ${line.direction === 'DECREASE' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
              >
                <ArrowDown className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {line.kind === 'ACCOUNT' && (
        <div className="mt-4 flex flex-col gap-3">
          <Selector
            value={line.account_id ? accountName(line.account_id) : undefined}
            placeholder="Choose account"
            icon={WalletCards}
            onClick={() => onOpenPicker('account', line.id)}
          />
          {accounts.find((a) => a.id === line.account_id)?.type === 'EXPENSE' && (
            <Selector
              value={line.category_id ? categoryName(line.category_id) : undefined}
              placeholder="Choose category (optional)"
              icon={WalletCards}
              onClick={() => onOpenPicker('category', line.id)}
            />
          )}
        </div>
      )}

      {(line.kind === 'GIVE_LOAN' || line.kind === 'BORROW') && (
        <div className="mt-4">
          <Selector
            value={line.counterparty_id ? counterpartyName(line.counterparty_id) : undefined}
            placeholder="Choose counterparty"
            icon={Users}
            onClick={() => onOpenPicker('counterparty', line.id)}
          />
        </div>
      )}

      {(line.kind === 'RECEIVE_LOAN_REPAYMENT' || line.kind === 'REPAY_LOAN') && (
        <div className="mt-4">
          <Selector
            value={line.loan_id ? loanLabel(line.loan_id) : undefined}
            placeholder="Choose loan"
            icon={Banknote}
            onClick={() => onOpenPicker('loan', line.id)}
          />
        </div>
      )}
    </article>
  );
}