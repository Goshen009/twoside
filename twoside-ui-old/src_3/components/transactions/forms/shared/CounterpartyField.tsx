import { ChevronRight, User } from "lucide-react";

type CounterpartyFieldProps = {
  label: string;
  selected_name: string | null | undefined;
  placeholder: string;
  on_click: () => void;
};

export default function CounterpartyField({ label, selected_name, placeholder, on_click }: CounterpartyFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</label>
      <button
        type="button"
        onClick={on_click}
        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
      >
        <div className="flex items-center gap-2 truncate">
          <User className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className={`truncate ${selected_name ? "text-zinc-100" : "text-muted/50"}`}>
            {selected_name || placeholder}
          </span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
      </button>
    </div>
  );
}