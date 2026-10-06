import { useRef, useState, type FormEvent } from "react";
import { Loader2, Merge, Trash2 } from "lucide-react";
import type { Tag } from "@/types/types";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const MAX_LEN = 50;

interface TagDetailProps {
  tag: Tag;
  tags: Tag[];
  onDone: () => void;
  onMerge: () => void;
}

export function TagDetail({ tag, tags, onDone, onMerge }: TagDetailProps) {
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const [is_renaming, setIsRenaming] = useState(false);
  const [confirm_delete, setConfirmDelete] = useState(false);
  const [is_deleting, setIsDeleting] = useState(false);
  const in_flight = useRef(false);

  const trimmed = name.trim();
  const is_duplicate = tags.some((t) => t.id !== tag.id && t.name.toLowerCase() === trimmed.toLowerCase());
  const can_rename = trimmed.length > 0 && trimmed !== tag.name && !is_duplicate;
  const busy = is_renaming || is_deleting;

  async function handleRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!can_rename || busy || in_flight.current) return;

    in_flight.current = true;
    setIsRenaming(true);
    setError(null);

    try {
      await Endpoints.renameTag(tag.id, trimmed);
      useUserStore.getState().refetch();
      useTransactionsStore.getState().refetch();
      onDone();
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
    } finally {
      in_flight.current = false;
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    if (busy || in_flight.current) return;

    in_flight.current = true;
    setIsDeleting(true);
    setError(null);

    try {
      await Endpoints.deleteTag(tag.id);
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
      setConfirmDelete(false);
      setIsDeleting(false);
      in_flight.current = false;
      return;
    }

    // If the list was filtered by this tag, that filter is now dead: drop it.
    const txns = useTransactionsStore.getState();
    if (txns.tag_id === tag.id) txns.fetch(null);
    else txns.refetch();
    useUserStore.getState().refetch();

    in_flight.current = false;
    setConfirmDelete(false);
    onDone();
  }

  return (
    <>
      <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3.5">
        <form onSubmit={handleRename} className="space-y-2.5">
          <label className="block px-0.5 text-2xs font-semibold uppercase tracking-wider text-muted">Name</label>
          <input
            value={name}
            maxLength={MAX_LEN}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Tag name"
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-medium text-foreground outline-none placeholder:text-muted/60 focus:border-primary"
          />

          {is_duplicate && <p className="px-0.5 text-xs font-medium text-rose">A tag with that name already exists.</p>}
          {error && (
            <p role="alert" className="rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!can_rename || busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {is_renaming && <Loader2 className="h-4 w-4 animate-spin" />}
            Save name
          </button>
        </form>

        <button
          type="button"
          disabled={busy || tags.length < 2}
          onClick={onMerge}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-hover active:scale-[0.98] disabled:opacity-40"
        >
          <Merge className="h-4 w-4" />
          Merge into...
        </button>

        <div className="border-t border-border pt-6">
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose/30 bg-rose/10 py-3.5 text-sm font-bold text-rose transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete tag
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm_delete}
        title="Delete tag?"
        message={`Spends tagged "${tag.name}" will become Untagged. This can't be undone.`}
        confirm_label="Yes, delete"
        danger
        loading={is_deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}