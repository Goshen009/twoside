import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Plus, Search } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import type { PickerSheetProps } from "@/types/types";

/**
 * Reusable searchable single-select picker. Rendered as a Sheet (bottom-sheet
 * chrome lives once in Sheet.tsx) layered above whatever opened it. The accent
 * (radio dot, selected ring, create action) matches the form's accent when the
 * caller passes one — otherwise it falls back to the theme primary.
 */
export function PickerSheet(props: PickerSheetProps) {
  const {
    open,
    title,
    items,
    selected_id,
    on_select,
    on_close,
    show_none = false,
    none_label = "None / Clear",
    on_none,
    show_create = false,
    create_label = "Create new…",
    create_placeholder = "New name",
    on_create,
    search_placeholder = "Search",
    empty_message = "No options",
    accent_color = "var(--color-primary)",
  } = props;

  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [new_name, setNewName] = useState("");

  useEffect(() => {
    if (open) {
      setQuery("");
      setCreating(false);
      setNewName("");
    }
  }, [open]);

  const trimmed_query = query.trim().toLowerCase();
  const filtered = trimmed_query
    ? items.filter((item) => item.name.toLowerCase().includes(trimmed_query))
    : items;
  const show_search = items.length >= 5;

  function choose(id: string): void {
    on_select(id);
    on_close();
  }

  function chooseNone(): void {
    on_none?.();
    on_close();
  }

  function confirmCreate(): void {
    const name = new_name.trim();
    if (!name) return;
    on_create?.(name);
    on_close();
  }

  return (
    <Sheet open={open} on_close={on_close} title={title}>
      <div
        className="flex flex-col gap-2"
        style={{ "--form-accent": accent_color } as CSSProperties}
      >
        {creating ? (
          <div className="space-y-2 py-1">
            <input
              type="text"
              autoFocus
              value={new_name}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") confirmCreate();
              }}
              placeholder={create_placeholder}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:border-(--form-accent)/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex-1 cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!new_name.trim()}
                onClick={confirmCreate}
                className="flex-1 cursor-pointer rounded-xl bg-(--form-accent) px-3 py-2 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <>
            {show_search ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted/60" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={search_placeholder}
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-xs text-zinc-100 placeholder:text-muted/50 focus:border-(--form-accent)/50 focus:outline-none"
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              {show_none ? (
                <button
                  type="button"
                  onClick={chooseNone}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected_id == null
                      ? "border-(--form-accent)/40 bg-(--form-accent)/10"
                      : "border-white/5 bg-black/20 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`text-xs ${
                      selected_id == null ? "text-zinc-100" : "text-muted"
                    }`}
                  >
                    {none_label}
                  </span>
                  {selected_id == null ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-(--form-accent)" />
                  ) : null}
                </button>
              ) : null}

              {filtered.map((item) => {
                const is_selected = item.id === selected_id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => choose(item.id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      is_selected
                        ? "border-(--form-accent)/40 bg-(--form-accent)/10"
                        : "border-white/5 bg-black/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-xs ${
                          is_selected ? "text-zinc-100" : "text-zinc-300"
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.subtitle ? (
                        <span className="block truncate font-mono text-[10px] text-muted">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                    {is_selected ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-(--form-accent)" />
                    ) : null}
                  </button>
                );
              })}

              {show_create ? (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/10 px-3 py-2.5 text-left text-xs text-(--form-accent) transition-colors hover:bg-(--form-accent)/5"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  {create_label}
                </button>
              ) : null}

              {filtered.length === 0 && !show_none && !show_create ? (
                <p className="px-1 py-3 text-center text-xs text-muted">
                  {empty_message}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
