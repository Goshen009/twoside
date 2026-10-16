import { Sparkles, X } from "lucide-react";
import type { Announcement } from "@/lib/Announcements";

export function AnnouncementBanner({
  announcement,
  onDismiss,
}: {
  announcement: Announcement;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="h-4 w-4" />
      </span>

      <p className="min-w-0 flex-1 pt-1 text-xs font-semibold text-foreground">{announcement.message}</p>

      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="-mr-1.5 -mt-1.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}