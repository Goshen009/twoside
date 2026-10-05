import { Calendar, X } from "lucide-react";
import { DateTime } from "luxon";

interface JumpToDateProps {
  value: string | null; // YYYY-MM-DD in the user's timezone
  timezone: string;
  onChange: (value: string | null) => void;
}

export function JumpToDate({ value, timezone, onChange }: JumpToDateProps) {
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");
  const label = value ? DateTime.fromISO(value, { zone: timezone }).toFormat("MMM d, yyyy") : "Jump to date";

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-2xs font-semibold transition-colors ${
          value ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface text-muted"
        }`}
      >
        <Calendar className="h-3 w-3" />
        <span>{label}</span>
        <input
          type="date"
          aria-label="Jump to date"
          value={value ?? ""}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {value && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={() => onChange(null)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}