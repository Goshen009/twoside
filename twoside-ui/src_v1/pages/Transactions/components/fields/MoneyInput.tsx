interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency_symbol: string;
  size?: "lg" | "sm";
  placeholder?: string;
}

const sanitize = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  const capped = whole.slice(0, 10);
  return rest.length ? `${capped}.${rest.join("").slice(0, 2)}` : capped;
};

export function MoneyInput({ value, onChange, currency_symbol, size = "lg", placeholder = "0.00" }: MoneyInputProps) {
  const is_lg = size === "lg";
  return (
    <div className="relative flex items-center">
      <span className={`absolute left-3.5 font-bold text-muted ${is_lg ? "text-xs" : "text-xs font-medium"}`}>
        {currency_symbol}
      </span>
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(sanitize(e.target.value))}
        className={`w-full rounded-xl border border-border bg-background pl-8 pr-3.5 tracking-tight text-foreground outline-none text-sm placeholder:text-muted/50 placeholder:text-sm focus:border-(--form-accent) focus:ring-1 focus:ring-(--form-accent) ${
          is_lg ? "h-10 text-sm font-bold" : "h-9 text-xs placeholder:text-xs"
        }`}
      />
    </div>
  );
}