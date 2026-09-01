import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  HandCoins,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  Wallet,
  Tag,
  User
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

type DetailInfo = { icon: typeof Tag; text: string };

function getDetail(entry: JournalEntry): DetailInfo | null {
  if (entry.category_name) return { icon: Tag, text: entry.category_name };
  if (entry.related_account) return { icon: ArrowLeftRight, text: entry.related_account.name };
  if (entry.related_counterparty) return { icon: User, text: entry.related_counterparty.name };
  return null;
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
  // const amount_color = entry.log_type === "TRANSFER" ? "text-sky-400" : is_in ? "text-emerald-400" : "text-rose-400";

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
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-muted/90 font-normal">
                	<Wallet className="w-2.5 h-2.5" />
                 	{entry.account_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-mono font-bold ${is_in ? "text-emerald-400" : "text-rose-400"}`}>
            {is_in ? "+" : "-"}₦{Format.formatMoney(entry.amount)}
          </div>
          {detail && (
            <div className="flex items-center justify-end gap-1 text-[10px] text-muted/80 mt-0.5 font-normal tracking-tight">
              <detail.icon className="w-2.5 h-2.5" />
              <span>{detail.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}