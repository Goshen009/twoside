import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { Endpoints } from "@/api/endpoints";
import { ApiError } from "@/api/client";

const MAX_LEN = 50;

export function EditName({ onDone }: { onDone: () => void }) {
  const current = useUserStore((s) => s.data?.username) ?? "";

  const [username, setUsername] = useState(current);
  const [error, setError] = useState<string | null>(null);
  const [is_saving, setIsSaving] = useState(false);
  const in_flight = useRef(false);

  const trimmed = username.trim();
  const can_save = trimmed.length > 0 && trimmed !== current;

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!can_save || is_saving || in_flight.current) return;

    in_flight.current = true;
    setIsSaving(true);
    setError(null);

    try {
      await Endpoints.editInfo({ name: trimmed });
      useUserStore.getState().refetch();
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
      <form onSubmit={handleSave} className="space-y-2.5">
        <label htmlFor="name" className="block px-0.5 text-2xs font-semibold uppercase tracking-wider text-muted">
          Name
        </label>
        <input
          id="name"
          value={username}
          maxLength={MAX_LEN}
          autoComplete="name"
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
          placeholder="Your name"
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-xs font-medium text-foreground outline-none placeholder:text-muted/60 focus:border-primary"
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
          Save name
        </button>
      </form>
    </div>
  );
}