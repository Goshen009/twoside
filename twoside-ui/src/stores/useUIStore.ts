import { create } from "zustand";
import { persist } from "zustand/middleware";

type Overrides = Record<string, boolean>;

interface UIState {
  is_amounts_hidden: boolean;
  day_overrides: Overrides;
  install_hint_snoozed: boolean;
  toggleAmountsHidden: () => void;
  setDayOverrides: (next: Overrides | ((prev: Overrides) => Overrides)) => void;
  snoozeInstallHint: () => void;
  seen_announcements: string[];
  markAnnouncementSeen: (id: string) => void;
  markAllAnnouncementsSeen: (ids: string[]) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      is_amounts_hidden: false,
      day_overrides: {},
      install_hint_snoozed: false,
      toggleAmountsHidden: () => set((s) => ({ is_amounts_hidden: !s.is_amounts_hidden })),
      setDayOverrides: (next) =>
        set((s) => ({ day_overrides: typeof next === "function" ? next(s.day_overrides) : next })),
      snoozeInstallHint: () => set({ install_hint_snoozed: true }),
      seen_announcements: [],
      markAnnouncementSeen: (id) =>
        set((s) => (s.seen_announcements.includes(id) ? s : { seen_announcements: [...s.seen_announcements, id] })),
      markAllAnnouncementsSeen: (ids) =>
        set((s) => ({ seen_announcements: Array.from(new Set([...s.seen_announcements, ...ids])) })),
    }),
    {
      name: "ui-prefs",
      version: 1,
      partialize: ({ is_amounts_hidden, seen_announcements }) => ({ is_amounts_hidden, seen_announcements }),
    }
  )
);