import { Plus, Trash2, Wallet } from "lucide-react";
import { type Account } from "../../../../hooks/useAccounts";
import Format from "../../../../libs/format";
import { type Allocation } from "../../../../hooks/useAllocations";

type AllocationsListProps = {
  label: string;
  add_label: string;
  total_label: string;
  total_color?: string;
  allocations: Allocation[];
  accounts: Account[];
  on_add: () => void;
  on_remove: (id: string) => void;
  on_amount_change: (id: string, amount: string) => void;
  on_open_account_picker: (allocation_id: string) => void;
  total: number;
};

export default function AllocationsList({
  label, add_label, total_label, total_color = "text-zinc-100",
  allocations, accounts, on_add, on_remove, on_amount_change, on_open_account_picker, total,
}: AllocationsListProps) {
  return (
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</label>
        <button 
          type="button" 
          onClick={on_add} 
          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <Plus className="w-3 h-3" /> {add_label}
        </button>
      </div>

      <div className="space-y-2 overflow-hidden">
        {allocations.map((allocation) => {
          const selected_account = accounts.find((a) => a.id === allocation.account_id);
          return (
            <div 
              key={allocation.id} 
              className="flex items-center gap-2 bg-black/30 border border-white/10 p-1.5 rounded-2xl hover:border-white/20 transition-all transform-gpu"
            >
              <button
                type="button"
                onClick={() => on_open_account_picker(allocation.id)}
                className="flex-1 flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-2 rounded-xl text-left hover:border-primary/40 transition-all truncate"
              >
                <Wallet className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className={`text-xs truncate ${selected_account ? "text-zinc-100 font-medium" : "text-muted/50"}`}>
                		{selected_account
                      ? `${selected_account.name} (₦${selected_account.balance.toLocaleString("en-NG", { minimumFractionDigits: 2 })})`
                      : "Select account"}
                </span>
              </button>

              <div className="w-32 relative shrink-0">
                <span className="absolute left-3 top-2.5 text-xs text-muted font-mono">₦</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={allocation.amount}
                  onChange={(e) => on_amount_change(allocation.id, e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/5 rounded-xl pl-6 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              {allocations.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => on_remove(allocation.id)} 
                  className="p-2 text-muted hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/30 border border-white/5 font-mono text-xs">
        <span className="text-muted text-[10px] uppercase tracking-wider">{total_label}</span>
        <span className={`font-bold ${total_color}`}>₦{Format.formatMoney(total)}</span>
      </div>
    </div>
  );
}