type DescriptionFieldProps = {
  value: string;
  on_change: (value: string) => void;
  placeholder?: string;
};

export default function DescriptionField({ value, on_change, placeholder }: DescriptionFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Description</label>
      <input
        type="text"
        placeholder={placeholder ?? "e.g., Grocery run, Coffee..."}
        value={value}
        onChange={(e) => on_change(e.target.value)}
        required
        className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}