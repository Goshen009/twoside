import { useState, type ReactNode } from "react";
import { Calendar, Check, ChevronDown, ChevronRight, Pencil, Plus, Tag as TagIcon } from "lucide-react";
import type { Tag } from "@/types/types";
import { Sheet } from "../components/Sheet";
import { Dates } from "@/lib/dates";

const LABEL = "text-2xs font-semibold uppercase tracking-wider text-muted";
const BOX = "rounded-xl border border-border bg-surface";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5 px-0.5">
        <span className={LABEL}>{label}</span>
        {hint && <span className="text-2xs text-muted/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Description ---------- */

export function DescriptionField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Description">
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 focus-within:border-primary ${BOX}`}>
        <Pencil className="h-3 w-3 shrink-0 text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          maxLength={100}
          placeholder="What was this for?"
          className="flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-xs placeholder:text-muted/60"
        />
      </div>
    </Field>
  );
}

/* ---------- Amount ---------- */

const sanitize = (raw: string): string => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  const capped = whole.slice(0, 10);
  return rest.length ? `${capped}.${rest.join("").slice(0, 2)}` : capped;
};

export function AmountField({
  value,
  onChange,
  currency_symbol,
}: {
  value: string;
  onChange: (v: string) => void;
  currency_symbol: string;
}) {
  return (
    <Field label="Amount">
      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-xs font-bold text-muted">{currency_symbol}</span>
        <input
          inputMode="decimal"
          value={value}
          placeholder="0.00"
          onChange={(e) => onChange(sanitize(e.target.value))}
          className="h-10 w-full rounded-xl border border-border bg-surface pl-8 pr-3.5 text-base font-bold tracking-tight text-foreground outline-none placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </Field>
  );
}

/* ---------- Date & time ---------- */

export function DateField({
  value,
  timezone,
  onChange,
}: {
  value: string; // UTC ISO
  timezone: string;
  onChange: (iso: string) => void;
}) {
  return (
    <Field label="Date & Time">
      <div className={`relative flex items-center justify-between px-3.5 py-2.5 ${BOX}`}>
        <div className="flex items-center gap-2.5">
          <Calendar className="h-3 w-3 text-muted" />
          <span className="text-xs font-medium text-foreground">{Dates.formatDateTime(value, timezone)}</span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted" />
        <input
          type="datetime-local"
          value={Dates.toInputValue(value, timezone)}
          onChange={(e) => {
            if (!e.target.value) return;
            const iso = Dates.fromInputValue(e.target.value, timezone);
            if (iso) onChange(iso);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </Field>
  );
}

/* ---------- Tag ---------- */

export function TagField({
  tags,
  value,
  onChange,
}: {
  tags: Tag[];
  value: string | null; // tag NAME
  onChange: (name: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label="Tag" hint="(Optional)">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex w-full items-center justify-between gap-2.5 px-3.5 py-2.5 text-left ${BOX}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <TagIcon className="h-3 w-3 shrink-0 text-muted" />
          <span className={`truncate text-xs font-medium ${value ? "text-foreground" : "text-muted/60"}`}>
            {value ?? "None"}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>

      <Sheet open={open} on_close={() => setOpen(false)} title="Select Tag">
        <TagPickerBody tags={tags} value={value} onSelect={onChange} onClose={() => setOpen(false)} />
      </Sheet>
    </Field>
  );
}

const ROW =
  "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors";
const ROW_ON = "border-primary/40 bg-primary/10";
const ROW_OFF = "border-border bg-surface hover:bg-surface-hover";

function Indicator({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        on ? "border-transparent bg-primary" : "border-border"
      }`}
    >
      {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
    </span>
  );
}

function TagPickerBody({
  tags,
  value,
  onSelect,
  onClose,
}: {
  tags: Tag[];
  value: string | null;
  onSelect: (name: string | null) => void;
  onClose: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");

  function pick(name: string | null) {
    onSelect(name);
    onClose();
  }

  function confirmCreate() {
    const name = draft.trim();
    if (!name) return;
    // typing an existing tag (any casing) reuses it instead of making a duplicate
    const existing = tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    pick(existing?.name ?? name);
  }

  if (creating) {
    return (
      <div className="space-y-3 py-1">
        <input
          autoFocus
          maxLength={50}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              confirmCreate();
            }
          }}
          placeholder="Tag name"
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-medium text-foreground outline-none placeholder:text-muted/60 focus:border-primary"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={confirmCreate}
            className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-background transition-opacity disabled:opacity-40"
          >
            Use this
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={() => pick(null)} className={`${ROW} ${value === null ? ROW_ON : ROW_OFF}`}>
        <span className={`text-xs font-medium ${value === null ? "text-foreground" : "text-muted"}`}>None</span>
        <Indicator on={value === null} />
      </button>

      {tags.map((t) => {
        const on = t.name === value;
        return (
          <button type="button" key={t.id} onClick={() => pick(t.name)} className={`${ROW} ${on ? ROW_ON : ROW_OFF}`}>
            <span className="truncate text-xs font-semibold text-foreground">{t.name}</span>
            <Indicator on={on} />
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-3 text-xs font-semibold text-primary"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Create New Tag
      </button>
    </div>
  );
}