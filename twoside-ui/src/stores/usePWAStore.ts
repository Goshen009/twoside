import { create } from "zustand";
import { PWA } from "@/lib/PWA";

export type InstallPromptEvent = Event & { prompt: () => Promise<void> };

interface PWAState {
  install_event: InstallPromptEvent | null;
  installed: boolean;
  promptInstall: () => Promise<void>;
}

export const usePWAStore = create<PWAState>((set, get) => ({
  install_event: null,
  installed: PWA.isStandalone(),
  promptInstall: async () => {
    const ev = get().install_event;
    if (!ev) return;
    await ev.prompt();
    set({ install_event: null });
  },
}));

// Chrome fires this once, early, usually before login finishes. Listening at
// module load means Home and Settings can still use it later.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  usePWAStore.setState({ install_event: e as InstallPromptEvent });
});

window.addEventListener("appinstalled", () => {
  PWA.markDone();
  usePWAStore.setState({ installed: true, install_event: null });
});