import { useEffect, useState } from "react";
import { BottomPanel } from "@/components/BottomPanel";
import { usePushStore } from "@/stores/usePushStore";
import { usePWAStore } from "@/stores/usePWAStore";
import { useUIStore } from "@/stores/useUIStore";
import { PWA } from "@/lib/PWA";

export function ReminderPrompt() {
  const status = usePushStore((s) => s.status);
  const busy = usePushStore((s) => s.busy);
  const enable = usePushStore((s) => s.enable);

  const installed = usePWAStore((s) => s.installed);
  const hint_snoozed = useUIStore((s) => s.install_hint_snoozed);
  const done = useUIStore((s) => s.reminder_prompt_done);
  const markDone = useUIStore((s) => s.markReminderPromptDone);

  const [armed, setArmed] = useState(false);

  const eligible =
    !done &&
    status === "off" &&
    Notification.permission === "default" &&
    (installed || hint_snoozed || PWA.isDone());

  // small pause so it doesn't land right on top of the install hint closing
  useEffect(() => {
    if (!eligible) return;
    const t = setTimeout(() => setArmed(true), 1200);
    return () => clearTimeout(t);
  }, [eligible]);

  async function turnOn() {
    try { await enable(); } catch { /* they can retry from Settings */ }
    markDone();
  }

  return (
    <BottomPanel open={eligible && armed} onClose={markDone}>
      <div className="space-y-4 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
        <h2 className="text-md font-semibold text-foreground">Want a daily reminder?</h2>
        <p className="text-xs leading-relaxed text-muted">
          A quick nudge so you don't forget to log your spends. You can change this anytime in Settings.
        </p>
        <button
          type="button"
          onClick={turnOn}
          disabled={busy}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-background disabled:opacity-60"
        >
          Turn on reminders
        </button>
        <button type="button" onClick={markDone} className="w-full text-xs font-semibold text-muted">
          Not now
        </button>
      </div>
    </BottomPanel>
  );
}