import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";
import { PickerField } from "@/components/PickerField";
import { Locales } from "@/lib/Locales";
import type { NewUser } from "@/types/types";
import { AuthShell } from "./AuthShell";
import { Announcements } from "@/lib/Announcements";

const MAX_LEN = 50;

export default function OnboardingPage({ new_user }: { new_user: NewUser }) {
  // Sliced so a long Google name can't exceed the backend's 50-char limit.
  const [name, setName] = useState(new_user.name.slice(0, MAX_LEN));
  const [currency, setCurrency] = useState<string>(new_user.currency_symbol);
  const [timezone, setTimezone] = useState<string>(new_user.timezone);
  const [error, setError] = useState<string | null>(null);
  const [is_saving, setIsSaving] = useState(false);
  const in_flight = useRef(false);

  const trimmed = name.trim();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!trimmed || is_saving || in_flight.current) return;

    const patch: { name?: string; currency_symbol?: string; timezone?: string } = {};
    if (trimmed !== new_user.name) patch.name = trimmed;
    if (currency !== new_user.currency_symbol) patch.currency_symbol = currency;
    if (timezone !== new_user.timezone) patch.timezone = timezone;

    in_flight.current = true;
    setIsSaving(true);
    setError(null);

    try {
      if (Object.keys(patch).length > 0) await Endpoints.editInfo(patch);
      // They just set this up, so the "you can now change..." banner isn't news to them.
      useUIStore.getState().markAllAnnouncementsSeen(Announcements.LIST.map((a) => a.id));
      useAuthStore.getState().completeOnboarding();
    } catch (err) {
      setError(ApiError.getErrorMessage(err));
    } finally {
      in_flight.current = false;
      setIsSaving(false);
    }
  }

  return (
    <AuthShell
      headline="Let's have your preferences, shall we?"
      is_error={!!error}
      error_message={error ?? undefined}
      onDismissError={() => setError(null)}
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
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
          onChange={setCurrency}
        />

        <PickerField
          label="Timezone"
          title="Select timezone"
          value={timezone}
          options={Locales.SUPPORTED_TIMEZONES.map((v) => ({ value: v, label: Locales.TIMEZONE_LABELS[v] }))}
          onChange={setTimezone}
        />

        <button
          type="submit"
          disabled={!trimmed || is_saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {is_saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue
        </button>
      </form>
    </AuthShell>
  );
}