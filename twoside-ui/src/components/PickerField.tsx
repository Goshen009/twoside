import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Sheet } from "@/components/Sheet";

export function PickerField({
  label,
  title,
  value,
  options,
  onChange,
}: {
  label: string;
  title: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      <span className="block px-0.5 text-2xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="truncate text-xs font-medium text-foreground">
          {options.find((o) => o.value === value)?.label ?? value}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
      </button>

      <Sheet open={open} on_close={() => setOpen(false)} title={title}>
        <div className="space-y-2">
          {options.map((opt) => {
            const on = opt.value === value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                  on ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <span className="text-xs font-semibold text-foreground">{opt.label}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    on ? "border-transparent bg-primary" : "border-border"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </Sheet>
    </div>
  );
}