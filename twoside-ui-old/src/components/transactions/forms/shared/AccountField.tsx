import { Wallet } from "lucide-react";
import { type Account } from "../../../../hooks/useAccounts";

type AccountFieldProps = {
  label: string;
  selected_account: Account | null | undefined;
  on_click: () => void;
};

export default function AccountField({ label, selected_account, on_click }: AccountFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={on_click}
        className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center gap-2 hover:border-primary/40 transition-all truncate"
      >
        <Wallet className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className={`truncate ${selected_account ? "text-zinc-100" : "text-muted/50"}`}>
          {selected_account
            ? `${selected_account.name} (₦${selected_account.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })})`
            : "Select account"}
        </span>
      </button>
    </div>
  );
}