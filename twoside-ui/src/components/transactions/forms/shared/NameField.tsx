import { ChevronDown } from "lucide-react";
import type { NameFieldProps } from "@/types/types";

/**
 * Card row that opens a picker for a name value (category, counterparty, …).
 * Shows the chosen name or a muted placeholder; error sits underneath.
 */
export function NameField(props: NameFieldProps) {
  const { icon: Icon, value, placeholder, error, optional_label, on_click } =
    props;

  return (
    <div>
      <button
        type="button"
        onClick={on_click}
        className="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/[0.02] active:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--form-accent)/30"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted" />
        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            value ? "text-zinc-100" : "text-muted/60"
          }`}
        >
          {value ?? placeholder}
        </span>
        {optional_label ? (
          <span className="shrink-0 text-[10px] text-muted/50">
            {optional_label}
          </span>
        ) : null}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted/70" />
      </button>
      {error ? (
        <p className="px-4 pb-2.5 text-[11px] text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
