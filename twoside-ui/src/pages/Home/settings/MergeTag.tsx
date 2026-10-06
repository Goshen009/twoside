import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { Tag } from "@/types/types";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface MergeTagProps {
  tag: Tag;
  tags: Tag[];
  onDone: () => void;
}

export function MergeTag({ tag, tags, onDone }: MergeTagProps) {
  const [target_id, setTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [is_merging, setIsMerging] = useState(false);
  const in_flight = useRef(false);

  const others = tags.filter((t) => t.id !== tag.id);
  const target = others.find((t) => t.id === target_id);

  async function handleMerge() {
    if (!target || in_flight.current) return;

    in_flight.current = true;
    setIsMerging(true);
    setError(null);

    try {
      await Endpoints.mergeTag(tag.id, target.id);
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
      setConfirming(false);
      setIsMerging(false);
      in_flight.current = false;
      return;
    }

    // The source tag no longer exists. If the list was filtered by it, drop the filter.
    const txns = useTransactionsStore.getState();
    if (txns.tag_id === tag.id) txns.fetch(null);
    else txns.refetch();
    useUserStore.getState().refetch();

    in_flight.current = false;
    setConfirming(false);
    onDone();
  }

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 pb-4 pt-3.5">
        {others.length === 0 ? (
          <p className="py-10 text-center text-xs text-muted">No other tags to merge into.</p>
        ) : (
          others.map((t) => {
            const on = t.id === target_id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  setTargetId(on ? null : t.id);
                  setError(null);
                }}
                className={`flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  on ? "border-primary/40 bg-primary/10" : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <span className="truncate text-xs font-semibold text-foreground">{t.name}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    on ? "border-transparent bg-primary" : "border-border"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-background" strokeWidth={3} />}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="shrink-0 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
        {error && (
          <p role="alert" className="mb-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={!target || is_merging}
          onClick={() => setConfirming(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {is_merging && <Loader2 className="h-4 w-4 animate-spin" />}
          {target ? `Merge into ${target.name}` : "Merge"}
        </button>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Merge tags?"
        message={`All "${tag.name}" spends will move to "${target?.name ?? ""}", and "${tag.name}" will be deleted. This can't be undone.`}
        confirm_label="Yes, merge"
        danger
        loading={is_merging}
        onConfirm={handleMerge}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}