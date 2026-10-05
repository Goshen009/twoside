import { useState } from "react";
import { Check, ListFilter } from "lucide-react";
import type { Tag } from "@/types/types";
import { Sheet } from "./Sheet";

interface TagFilterProps {
  tags: Tag[];
  value: string | null;
  onChange: (tag_id: string | null) => void;
}

export function TagFilter({ tags, value, onChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);
  const active_tag = tags.find((t) => t.id === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-2xs font-semibold transition-colors ${
          active_tag ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-surface text-muted"
        }`}
      >
        <ListFilter className="h-3 w-3" />
        <span className="max-w-24 truncate">{active_tag ? active_tag.name : "Filter"}</span>
      </button>

      <Sheet open={open} on_close={() => setOpen(false)} title="Filter by Tag">
        <TagFilterBody
          tags={tags}
          value={value}
          onApply={(id) => {
            setOpen(false);
            if (id !== value) onChange(id);
          }}
        />
      </Sheet>
    </>
  );
}

function TagFilterBody({
  tags,
  value,
  onApply,
}: {
  tags: Tag[];
  value: string | null;
  onApply: (id: string | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(value);

  return (
    <div className="space-y-2">
      {tags.length === 0 && (
        <p className="py-6 text-center text-xs text-muted">No tags yet.</p>
      )}

      {tags.map((t) => {
        const on = draft === t.id;
        return (
          <button
            type="button"
            key={t.id}
            onClick={() => setDraft(on ? null : t.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
              on ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:bg-surface-hover"
            }`}
          >
            <span className="text-xs font-semibold text-foreground">{t.name}</span>
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

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setDraft(null)}
          className="flex-1 rounded-xl border border-border py-3 text-xs font-semibold text-muted transition-colors hover:bg-surface-hover"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-background"
        >
          Apply
        </button>
      </div>
    </div>
  );
}