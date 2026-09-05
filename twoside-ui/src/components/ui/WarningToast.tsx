import { AlertTriangle, X } from "lucide-react";
import type { WarningToastProps } from "@/types/types";

export function WarningToast({ message, on_close }: WarningToastProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-950/60 px-3 py-2.5 text-xs text-amber-200">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={on_close}
        aria-label="Dismiss warning"
        className="cursor-pointer text-amber-300/70 transition-colors hover:text-amber-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
