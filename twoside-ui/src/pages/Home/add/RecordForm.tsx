import { useRef, useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { Dates } from "@/lib/dates";
import { AmountField, DateField, DescriptionField, TagField } from "./fields";

export function RecordForm({ onSaved }: { onSaved: () => void }) {
  const info = useUserStore((s) => s.data);
  const timezone = info?.timezone ?? "Africa/Lagos";
  const currency_symbol = info?.currency_symbol ?? "₦";

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date_iso, setDateIso] = useState(Dates.nowIso);
  const [tag, setTag] = useState<string | null>(null);

  const [is_submitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const in_flight = useRef(false);

  const can_submit = description.trim().length > 0 && Number(amount) > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!can_submit || in_flight.current) return;

    in_flight.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      await Endpoints.record({
        description: description.trim(),
        amount: Number(amount),
        transaction_date: date_iso,
        ...(tag ? { tag: tag.trim() } : {}),
      });
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
      return;
    } finally {
      in_flight.current = false;
      setIsSubmitting(false);
    }

    onSaved();
  }

  return (
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
        <button
          type="submit"
          disabled={!can_submit || is_submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {is_submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
          Save Spend
        </button>
      </div>
    </form>
  );
}