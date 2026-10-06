import { useRef, useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { EditPayload, Transaction } from "@/types/types";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { Dates } from "@/lib/dates";
import { BottomPanel } from "@/components/BottomPanel";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { AmountField, DateField, DescriptionField, TagField } from "../add/fields";

interface EditTransactionFlowProps {
  transaction: Transaction | null; // null = closed
  onClose: () => void;
}

export function EditTransactionFlow({ transaction, onClose }: EditTransactionFlowProps) {
  return (
    <BottomPanel open={transaction !== null} onClose={onClose}>
      {transaction && <EditForm key={transaction.id} transaction={transaction} onClose={onClose} />}
    </BottomPanel>
  );
}

type Pending = "save" | "delete" | null;

function EditForm({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const info = useUserStore((s) => s.data);
  const timezone = info?.timezone ?? "Africa/Lagos";
  const currency_symbol = info?.currency_symbol ?? "₦";

  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount);
  const [date_iso, setDateIso] = useState(transaction.transaction_date);
  const [tag, setTag] = useState<string | null>(transaction.tag);

  const [pending, setPending] = useState<Pending>(null);
  const [is_submitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const in_flight = useRef(false);

  // Only what actually changed goes to the server.
  const patch: EditPayload = {};
  if (description.trim() !== transaction.description) patch.description = description.trim();
  if (Number(amount) !== Number(transaction.amount)) patch.amount = Number(amount);
  if (!Dates.sameInstant(date_iso, transaction.transaction_date)) patch.transaction_date = date_iso;
  if (tag !== transaction.tag) patch.tag = tag ? tag.trim() : null;

  const is_valid = description.trim().length > 0 && Number(amount) > 0;
  const can_save = is_valid && Object.keys(patch).length > 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (can_save && !is_submitting) setPending("save");
  }

  async function runConfirmed() {
    if (!pending || in_flight.current) return;
    in_flight.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      if (pending === "save") await Endpoints.editTransaction(transaction.id, patch);
      else await Endpoints.deleteTransaction(transaction.id);
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
      setPending(null);
      return;
    } finally {
      in_flight.current = false;
      setIsSubmitting(false);
    }

    setPending(null);
    onClose();
    // silent refetches: today's total + tag list, and the (still filtered) list
    useUserStore.getState().refetch();
    useTransactionsStore.getState().refetch();
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2">
        <h2 className="text-md font-semibold tracking-tight text-foreground">Edit Spend</h2>
        <button
          type="button"
          aria-label="Delete transaction"
          disabled={is_submitting}
          onClick={() => setPending("delete")}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-rose/10 hover:text-rose disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4 pt-3.5">
          <DescriptionField value={description} onChange={setDescription} />
          <AmountField value={amount} onChange={setAmount} currency_symbol={currency_symbol} />
          <DateField value={date_iso} timezone={timezone} onChange={setDateIso} />
          <TagField tags={info?.tags ?? []} value={tag} onChange={setTag} />
        </div>

        <div className="shrink-0 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
          {error && (
            <p role="alert" className="mb-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={is_submitting}
              className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-hover disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!can_save || is_submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              {is_submitting && pending === "save" && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title={pending === "delete" ? "Delete transaction?" : "Save changes?"}
        message={`Are you sure you want to ${pending === "delete" ? "delete" : "edit"} this transaction?`}
        confirm_label={pending === "delete" ? "Yes, delete" : "Yes, edit"}
        danger={pending === "delete"}
        loading={is_submitting}
        onConfirm={runConfirmed}
        onCancel={() => setPending(null)}
      />
    </>
  );
}