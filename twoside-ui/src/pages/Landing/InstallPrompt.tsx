import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPrompt() {
  const [deferred_prompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios_instructions_open, setIosInstructionsOpen] = useState(false);
  const on_ios = isIOS();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferred_prompt) return;
    await deferred_prompt.prompt();
    setDeferredPrompt(null);
  };

  if (on_ios) {
    return (
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => setIosInstructionsOpen(true)}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 cursor-pointer"
        >
          Install the app
        </button>

        {ios_instructions_open && (
          <p className="text-xs text-muted text-center mt-3 leading-relaxed">
            Tap the Share icon in Safari, then "Add to Home Screen."
          </p>
        )}
      </div>
    );
  }

  if (deferred_prompt) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full max-w-sm h-11 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 cursor-pointer"
      >
        Install the app
      </button>
    );
  }

  // Not iOS, and no beforeinstallprompt fired yet (already installed, unsupported browser, or criteria not met)
  return null;
}