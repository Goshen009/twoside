import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  HandCoins,
  Landmark,
  ArrowRightLeft,
  CreditCard,
} from "lucide-react";
import Format from "../../libs/format";
import { type JournalEntry, type LogType } from "../../hooks/useAccountTransactions";

const TYPE_STYLES: Record<LogType, { icon: typeof ArrowUpRight; bg: string; color: string }> = {
  INCOME: { icon: ArrowDownLeft, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-400" },
  EXPENSE: { icon: ArrowUpRight, bg: "bg-rose-500/10 border-rose-500/20", color: "text-rose-400" },
  TRANSFER: { icon: ArrowLeftRight, bg: "bg-sky-500/10 border-sky-500/20", color: "text-sky-400" },
  GIVE_LOAN: { icon: HandCoins, bg: "bg-purple-500/10 border-purple-500/20", color: "text-purple-400" },
  BORROW: { icon: Landmark, bg: "bg-amber-500/10 border-amber-500/20", color: "text-amber-400" },
  RECEIVE_REPAYMENT: { icon: ArrowRightLeft, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-400" },
  REPAY_LOAN: { icon: CreditCard, bg: "bg-rose-500/10 border-rose-500/20", color: "text-rose-400" },
};

function getDetail(entry: JournalEntry): string {
  if (entry.category_name) return entry.category_name;
  if (entry.related_account) return entry.related_account.name;
  if (entry.related_counterparty) return entry.related_counterparty.name;
  return "";
}

type TransactionRowProps = {
  entry: JournalEntry;
  show_account_name?: boolean;
};

export default function TransactionRow({ entry, show_account_name }: TransactionRowProps) {
  const style = TYPE_STYLES[entry.log_type];
  const Icon = style.icon;
  const is_in = entry.side === "DEBIT"; // asset account: DEBIT = money in, CREDIT = money out
  const detail = getDetail(entry);

  return (
    <div className="bg-surface/90 border border-white/5 rounded-2xl">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${style.color}`} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-xs font-medium text-zinc-100 truncate">{entry.description}</div>
            <div className="flex items-center gap-2 text-[10px] text-muted font-sans">
              <span className="tracking-normal text-zinc-400 font-medium">{Format.formatDate(entry.transaction_date)}</span>
              {show_account_name && (
                <>
                  <span>•</span>
                  <span className="text-muted/90 font-normal">{entry.account_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-mono font-bold ${is_in ? "text-emerald-400" : "text-rose-400"}`}>
            {is_in ? "+" : "-"}₦{Format.formatMoney(entry.amount)}
          </div>
          {detail && (
            <div className="text-[10px] text-muted/80 mt-0.5 font-normal tracking-tight">{detail}</div>
          )}
        </div>
      </div>
    </div>
  );
}