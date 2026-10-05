import { Calendar, ChevronRight } from "lucide-react";
import { FormField } from "./FormField";
import { DateTime } from "luxon";

import Format from "@/lib/Format";

interface DateTimeFieldProps {
  value: string; // UTC ISO
  timezone: string;
  onChange: (iso: string) => void;
}

export function DateTimeField({ value, timezone, onChange }: DateTimeFieldProps) {
  const input_value = DateTime.fromISO(value, { zone: "utc" }).setZone(timezone).toFormat("yyyy-MM-dd'T'HH:mm");

  return (
    <FormField label="Date & Time">
      <div className="relative flex items-center justify-between rounded-xl border border-border bg-surface px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-3 w-3 text-muted" />
          <span className="text-xs font-medium text-foreground">{Format.time(value, timezone).full}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted" />
        <input
          type="datetime-local"
          value={input_value}
          onChange={(e) => {
            if (!e.target.value) return;
            const iso = DateTime.fromISO(e.target.value, { zone: timezone }).toUTC().toISO();
            if (iso) onChange(iso);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </FormField>
  );
}