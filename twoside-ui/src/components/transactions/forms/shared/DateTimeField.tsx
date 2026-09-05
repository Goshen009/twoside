import { Calendar } from "lucide-react";
import { FormatUtils } from "@/lib/FormatUtils";
import type { DateTimeFieldProps } from "@/types/types";

/**
 * datetime-local picker rendered as a quiet row ("September 5, 2026 10:49 AM").
 * The real <input type="datetime-local"> sits transparent over the whole row so
 * tapping anywhere opens the native picker; the value is formatted for display.
 */
export function DateTimeField(props: DateTimeFieldProps) {
  const { error, ref, ...input_props } = props;
  const raw_value =
    typeof input_props.value === "string" ? input_props.value : "";
  const display = raw_value ? FormatUtils.formatDateTimeLabel(raw_value) : "";

  return (
    <div className="px-4 py-3 transition-colors hover:bg-white/[0.02] active:bg-white/[0.04]">
      <div className="relative flex min-w-0 cursor-pointer items-center gap-2">
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
        <Calendar className="pointer-events-none h-3.5 w-3.5 shrink-0 text-muted" />
        <span
          className={`min-w-0 flex-1 truncate text-xs ${
            display ? "text-zinc-100" : "text-muted/60"
          }`}
        >
          {display || "Set date & time"}
        </span>
      </div>
      {error ? <p className="mt-0.5 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
