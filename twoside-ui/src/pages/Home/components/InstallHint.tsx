import { useState } from "react";
import { BottomPanel } from "@/components/BottomPanel";
import { InstallGuide } from "./InstallGuide";
import { useUIStore } from "@/stores/useUIStore";
import { usePWAStore } from "@/stores/usePWAStore";
import { PWA } from "@/lib/PWA";

export function InstallHint() {
  const snoozed = useUIStore((s) => s.install_hint_snoozed);
  const snooze = useUIStore((s) => s.snoozeInstallHint);
  const installed = usePWAStore((s) => s.installed);

  const [done, setDone] = useState(PWA.isDone);

  const gotIt = () => {
    PWA.markDone();
    setDone(true);
  };

  const open = !done && !installed && !snoozed;

  return (
    <BottomPanel open={open} onClose={snooze}>
      <header className="shrink-0 px-6 pb-1 pt-2">
        <h2 className="text-md font-semibold tracking-tight text-foreground">Psst… install the app</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Add it to your home screen and it opens like any other app. No browser, no link, just tap and log.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-3">
        <InstallGuide />
      </div>

      <div className="flex shrink-0 gap-2 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={snooze}
          className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-hover"
        >
          Show me later
        </button>
        <button
          type="button"
          onClick={gotIt}
          className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-background shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
        >
          Okay, I've got it!
        </button>
      </div>
    </BottomPanel>
  );
}