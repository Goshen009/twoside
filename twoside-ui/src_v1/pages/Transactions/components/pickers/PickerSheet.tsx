import { useState, type CSSProperties } from "react";
import { Check, Plus } from "lucide-react";
import { Sheet } from "../Sheet";

export interface PickerItem {
  id: string;
  name: string;
  subtitle?: string;
  trailing?: string;
  disabled?: boolean;
}

interface PickerSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: PickerItem[];
  selected_id: string | null;
  onSelect: (id: string) => void;
  accent: string;
  none_label?: string;
  onNone?: () => void;
  create?: { label: string; placeholder: string; onCreate: (name: string) => void };
  empty_message?: string;
}

export function PickerSheet(props: PickerSheetProps) {
  return (
    <Sheet open={props.open} onClose={props.onClose} title={props.title}>
      {/* Sheet only mounts this while open, so the create draft resets on every open */}
      <PickerBody {...props} />
    </Sheet>
  );
}

const ROW = "flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const ROW_ON = "border-(--form-accent)/40 bg-(--form-accent)/10";
const ROW_OFF = "border-border bg-surface hover:bg-surface-hover";

function Indicator({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        on ? "border-transparent bg-(--form-accent)" : "border-border"
      }`}
    >
      {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
    </span>
  );
}

function PickerBody({ items, selected_id, onSelect, onClose, accent, none_label, onNone, create, empty_message = "Nothing here yet" }: PickerSheetProps) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");

  function choose(id: string) {
    onSelect(id);
    onClose();
  }

  function confirmCreate() {
    const name = draft.trim();
    if (!name || !create) return;
    create.onCreate(name);
    onClose();
  }

  return (
    <div className="flex flex-col gap-2" style={{ "--form-accent": accent } as CSSProperties}>
      {creating && create ? (
        <div className="space-y-3 py-1">
          <input
            autoFocus
            maxLength={100}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmCreate()}
            placeholder={create.placeholder}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-medium text-foreground outline-none placeholder:text-muted/60 focus:border-(--form-accent)"
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
              className="flex-1 rounded-xl bg-(--form-accent) py-2.5 text-xs font-bold text-background transition-opacity disabled:opacity-40"
            >
              Use this
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {onNone && (
            <button
              type="button"
              onClick={() => {
                onNone();
                onClose();
              }}
              className={`${ROW} ${selected_id === null ? ROW_ON : ROW_OFF}`}
            >
              <span className={`text-xs font-medium ${selected_id === null ? "text-foreground" : "text-muted"}`}>
                {none_label ?? "None"}
              </span>
              <Indicator on={selected_id === null} />
            </button>
          )}

          {items.map((item) => {
            const on = item.id === selected_id;
            return (
              <button
                type="button"
                key={item.id}
                disabled={item.disabled}
                onClick={() => choose(item.id)}
                className={`${ROW} ${on ? ROW_ON : ROW_OFF}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">{item.name}</span>
                  {item.subtitle && <span className="mt-0.5 block truncate text-2xs tabular-nums text-muted">{item.subtitle}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2.5">
                  {item.trailing && <span className="text-2xs text-muted">{item.trailing}</span>}
                  <Indicator on={on} />
                </span>
              </button>
            );
          })}

          {items.length === 0 && !onNone && !create && (
            <p className="py-4 text-center text-xs text-muted">{empty_message}</p>
          )}

          {create && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--form-accent)/30 bg-(--form-accent)/5 py-3 text-xs font-semibold text-(--form-accent)"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              {create.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}