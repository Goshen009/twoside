import { useRef, type KeyboardEvent, type RefObject } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { FormatUtils } from "@/lib/FormatUtils";
import type { DateRangeSheetProps } from "@/types/types";

type DateFieldRowProps = {
  label: string;
  value: string | null;
  input_ref: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
};

function openNativePicker(input_ref: RefObject<HTMLInputElement | null>): void {
  if (!input_ref.current) return;
  if (typeof input_ref.current.showPicker === "function") {
    input_ref.current.showPicker();
  } else {
    input_ref.current.click();
  }
}

function DateFieldRow({ label, value, input_ref, onChange }: DateFieldRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openNativePicker(input_ref)}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openNativePicker(input_ref);
        }
      }}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 transition-colors hover:border-primary/40"
    >
      <div className="min-w-0">
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className={`mt-0.5 text-xs font-medium ${value ? "text-zinc-100" : "text-muted"}`}>
          {value ? FormatUtils.formatDate(value) : "Any date"}
        </p>
      </div>
      <Calendar className="h-4 w-4 shrink-0 text-primary" />
      <input
        ref={input_ref}
        type="date"
        tabIndex={-1}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
      />
    </div>
  );
}

/** Bottom sheet for picking an inclusive start/end date range. Empty side = open
 *  ended. Changes are applied as you pick (the feed behind refetches live). */
export function DateRangeSheet({
  open,
  start_date,
  end_date,
  on_change,
  on_close,
}: DateRangeSheetProps) {
  const start_ref = useRef<HTMLInputElement>(null);
  const end_ref = useRef<HTMLInputElement>(null);
  const has_range = start_date !== null || end_date !== null;

  function handleStartChange(value: string): void {
    on_change(value || null, end_date);
  }

  function handleEndChange(value: string): void {
    on_change(start_date, value || null);
  }

  function handleClear(): void {
    on_change(null, null);
  }

  return (
    <Sheet open={open} on_close={on_close} title="Date range">
      <div className="flex flex-col gap-2">
        <DateFieldRow
          label="Start date"
          value={start_date}
          input_ref={start_ref}
          onChange={handleStartChange}
        />
        <DateFieldRow
          label="End date"
          value={end_date}
          input_ref={end_ref}
          onChange={handleEndChange}
        />
        <button
          type="button"
          onClick={handleClear}
          disabled={!has_range}
          className="mt-1 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" />
          Clear dates
        </button>
        <p className="px-1 text-center text-[10px] text-muted">
          Leave a side empty for an open-ended range.
        </p>
      </div>
    </Sheet>
  );
}