import { Calendar } from "lucide-react";
import { FormatUtils } from "@/lib/FormatUtils";
import type { DateTimeFieldProps } from "@/types/types";

/**
 * datetime-local picker rendered as a pretty readout ("September 5, 2026 10:49 AM").
 * The real <input type="datetime-local"> sits transparent over the row so tapping it
 * opens the native picker; the value is formatted for display from the input's value.
 */
export function DateTimeField(props: DateTimeFieldProps) {
  const { label, error, ref, ...input_props } = props;
  const raw_value =
    typeof input_props.value === "string" ? input_props.value : "";
  const display = raw_value ? FormatUtils.formatDateTimeLabel(raw_value) : "";

  return (
    <div className="space-y-1.5">
      {label ? (
        <label className="block text-[10px] font-mono uppercase tracking-wider text-muted">
          {label}
        </label>
      ) : null}
      <div className="relative flex items-center rounded-xl border border-primary/20 bg-black/30 transition-colors focus-within:border-primary/50">
        <Calendar className="pointer-events-none absolute left-3.5 h-4 w-4 shrink-0 text-muted" />
        <input
          {...input_props}
          ref={ref}
          type="datetime-local"
          step={60}
          value={raw_value}
          onClick={(event) => {
            // Desktop Chrome/Brave opens the picker only via showPicker() (or the
            // hidden calendar glyph); a plain focus does nothing visible.
            const maybe_show = (
              event.currentTarget as unknown as { showPicker?: () => void }
            ).showPicker;
            try {
              maybe_show?.();
            } catch {
              /* some browsers reject showPicker(); focus fallback is enough */
            }
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 focus:outline-none [color-scheme:dark]"
        />
        <span
          className={`pointer-events-none w-full truncate py-2.5 pl-10 pr-3.5 text-xs ${
            display ? "text-zinc-100" : "text-muted/60"
          }`}
        >
          {display || "Set date & time"}
        </span>
      </div>
      {error ? <p className="text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}
