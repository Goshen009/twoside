import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { PickerField } from "@/components/PickerField";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { Locales } from "@/lib/Locales";

const MAX_LEN = 50;

export function EditProfile({ onDone }: { onDone: () => void }) {
  const current_name = useUserStore((s) => s.data?.username) ?? "";
  const current_currency = useUserStore((s) => s.data?.currency_symbol) ?? "";
  const current_timezone = useUserStore((s) => s.data?.timezone) ?? "";

  const [name, setName] = useState(current_name);
  const [currency, setCurrency] = useState(current_currency);
  const [timezone, setTimezone] = useState(current_timezone);
  const [error, setError] = useState<string | null>(null);
  const [is_saving, setIsSaving] = useState(false);
  const in_flight = useRef(false);

  const trimmed = name.trim();
  const name_changed = trimmed !== current_name;
  const currency_changed = currency !== current_currency;
  const timezone_changed = timezone !== current_timezone;

  const can_save =
    trimmed.length > 0 && (name_changed || currency_changed || timezone_changed);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!can_save || is_saving || in_flight.current) return;

    const patch: { name?: string; currency_symbol?: string; timezone?: string } = {};
    if (name_changed) patch.name = trimmed;
    if (currency_changed) patch.currency_symbol = currency;
    if (timezone_changed) patch.timezone = timezone;

    in_flight.current = true;
    setIsSaving(true);
    setError(null);

    try {
      await Endpoints.editInfo(patch);
      useUserStore.getState().refetch();
      // Day grouping depends on the timezone, so transactions must reload too.
      if (timezone_changed) useTransactionsStore.getState().refetch();
      onDone();
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
    } finally {
      in_flight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3.5">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2.5">
          <label htmlFor="name" className="block px-0.5 text-2xs font-semibold uppercase tracking-wider text-muted">
            Name
          </label>
          <input
            id="name"
            value={name}
            maxLength={MAX_LEN}
            autoComplete="name"
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-medium text-foreground outline-none placeholder:text-muted/60 focus:border-primary"
          />
        </div>

        <PickerField
          label="Currency"
          title="Select currency"
          value={currency}
          options={Locales.SUPPORTED_CURRENCY_SYMBOLS.map((v) => ({ value: v, label: Locales.CURRENCY_LABELS[v] }))}
          onChange={(v) => {
            setCurrency(v);
            setError(null);
          }}
        />

        <PickerField
          label="Timezone"
          title="Select timezone"
          value={timezone}
          options={Locales.SUPPORTED_TIMEZONES.map((v) => ({ value: v, label: Locales.TIMEZONE_LABELS[v] }))}
          onChange={(v) => {
            setTimezone(v);
            setError(null);
          }}
        />

        {error && (
          <p role="alert" className="rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-xs font-medium text-rose">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!can_save || is_saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {is_saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </form>
    </div>
  );
}