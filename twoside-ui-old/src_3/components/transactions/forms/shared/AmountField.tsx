type AmountFieldProps = {
  value: string;
  on_change: (value: string) => void;
  label?: string;
};

export default function AmountField({ value, on_change, label = "Amount" }: AmountFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-muted uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-xs text-muted">₦</span>
        <input
          type="number"
          step="any"
          placeholder="0.00"
          value={value}
          onChange={(e) => on_change(e.target.value)}
          required
          className="w-full bg-black/30 border border-white/10 rounded-xl pl-6 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 font-mono"
        />
      </div>
    </div>
  );
}