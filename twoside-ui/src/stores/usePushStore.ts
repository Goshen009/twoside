import { create } from "zustand";
import { PWA } from "@/lib/PWA";
import { Endpoints } from "@/api/endpoints";

export type PushStatus = "checking" | "unsupported" | "needs_install" | "blocked" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const isSupported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// getRegistration() resolves to undefined when there's no worker.
// serviceWorker.ready would hang forever, which must never block logout.
const getSub = async () => {
  if (!isSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager?.getSubscription()) ?? null;
};

const saveSub = (sub: PushSubscription) => Endpoints.addWebPushSubscription(sub.toJSON());

interface PushState {
  status: PushStatus;
  busy: boolean;
  refresh: () => Promise<void>;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  teardown: (tell_server: boolean) => Promise<void>;
}

export const usePushStore = create<PushState>((set, get) => ({
  status: "checking",
  busy: false,

  refresh: async () => {
    // iOS Safari tabs don't expose PushManager at all, so check this first
    if (PWA.isIOS() && !PWA.isStandalone()) return set({ status: "needs_install" });
    if (!isSupported()) return set({ status: "unsupported" });
    if (Notification.permission === "denied") return set({ status: "blocked" });

    const sub = await getSub();
    if (sub && Notification.permission === "granted") {
      set({ status: "on" });
      saveSub(sub).catch(() => {}); // upsert: fixes rotated keys or an account switch
    } else {
      set({ status: "off" });
    }
  },

  // MUST be called straight from a tap handler (iOS requirement)
  enable: async () => {
    if (get().busy) return;
    set({ busy: true });
    try {
      // keep this as the first await so iOS still sees the user gesture
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return set({ status: permission === "denied" ? "blocked" : "off" });
      }
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
        }));
      await saveSub(sub);
      set({ status: "on" });
    } finally {
      set({ busy: false });
    }
  },

  // Settings toggle: throws on failure so the UI can show the error
  disable: async () => {
    if (get().busy) return;
    set({ busy: true });
    try {
      const sub = await getSub();
      if (sub) {
        await Endpoints.deleteWebPushSubscription(sub.endpoint); // server first, so a failure keeps the toggle honest
        await sub.unsubscribe();
      }
      set({ status: "off" });
    } finally {
      set({ busy: false });
    }
  },

  // Logout / session death: never throws, always stops this device from receiving pushes
  teardown: async (tell_server) => {
    try {
      const sub = await getSub();
      if (sub) {
        if (tell_server) await Endpoints.deleteWebPushSubscription(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
    } catch {
      /* best effort */
    }
    await get().refresh().catch(() => {});
  },
}));