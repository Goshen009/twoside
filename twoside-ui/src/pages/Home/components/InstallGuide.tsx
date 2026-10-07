import { useState, type ReactNode } from "react";
import { Download, MoreVertical, Plus, Share } from "lucide-react";
import { PWA } from "@/lib/PWA";
// import { usePWAStore } from "@/stores/usePWAStore";

type Platform = "ios" | "android";
type Step = { icon: ReactNode; text: ReactNode; image?: string }; // screenshots go in /public/help/

const STEPS: Record<Platform, Step[]> = {
  ios: [
    {
      icon: <Share className="h-4 w-4" />,
      text: <>In <b>Safari</b>, tap the <b>Share</b> button at the bottom of the screen.</>,
      // image: "/help/ios-1.png",
    },
    {
      icon: <Plus className="h-4 w-4" />,
      text: <>Scroll down and tap <b>Add to Home Screen</b>.</>,
      // image: "/help/ios-2.png",
    },
    {
      icon: <Download className="h-4 w-4" />,
      text: <>Tap <b>Add</b>. It now sits on your home screen like any other app.</>,
    },
  ],
  android: [
    {
      icon: <MoreVertical className="h-4 w-4" />,
      text: <>In <b>Chrome</b>, tap the <b>⋮ menu</b> at the top right.</>,
      // image: "/help/android-1.png",
    },
    {
      icon: <Plus className="h-4 w-4" />,
      text: <>Tap <b>Install app</b> (or <b>Add to Home screen</b>).</>,
      // image: "/help/android-2.png",
    },
    {
      icon: <Download className="h-4 w-4" />,
      text: <>Confirm. It now shows up in your apps list and home screen.</>,
    },
  ],
};

export function InstallGuide() {
  // const install_event = usePWAStore((s) => s.install_event);
  // const promptInstall = usePWAStore((s) => s.promptInstall);
  const [platform, setPlatform] = useState<Platform>(() => (PWA.isIOS() ? "ios" : "android"));

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-full border border-border bg-surface p-1">
        {(["ios", "android"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            className={`flex-1 rounded-full py-1.5 text-2xs font-semibold transition-colors ${
              platform === p ? "bg-primary text-background" : "text-muted"
            }`}
          >
            {p === "ios" ? "iPhone" : "Android"}
          </button>
        ))}
      </div>

      {/*{platform === "android" && install_event && (
        <button
          type="button"
          onClick={promptInstall}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 py-3 text-xs font-bold text-primary transition-colors active:bg-primary/20"
        >
          <Download className="h-4 w-4" />
          Install now
        </button>
      )}*/}

      {STEPS[platform].map((step, i) => (
        <div key={i} className="rounded-2xl border border-picker-border bg-picker-background p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              {step.icon}
            </span>
            <p className="pt-1.5 text-xs leading-relaxed text-foreground">{step.text}</p>
          </div>
          {step.image && (
            <img src={step.image} alt="" loading="lazy" className="mt-3 w-full rounded-xl border border-border" />
          )}
        </div>
      ))}
    </div>
  );
}