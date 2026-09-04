import { useRef } from "react";
import { Calendar } from "lucide-react";
import Format from "../../../../libs/format";

type DateFieldProps = {
  value: string;
  on_change: (value: string) => void;
  label?: string;
};

export default function DateField({ value, on_change, label = "Date" }: DateFieldProps) {
  const input_ref = useRef<HTMLInputElement>(null);

  function openPicker() {
    if (!input_ref.current) return;
    if (typeof input_ref.current.showPicker === "function") input_ref.current.showPicker();
    else input_ref.current.click();
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</label>
      <div
        onClick={openPicker}
        className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 cursor-pointer hover:border-primary/40 transition-all"
      >
        <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className={`text-xs font-normal truncate ${value ? "text-zinc-100" : "text-muted/50"}`}>
          {value ? Format.formatDateLong(value) : "Set date"}
        </span>
        <input ref={input_ref} type="date" value={value} onChange={(e) => on_change(e.target.value)} className="sr-only" />
      </div>
    </div>
  );
}