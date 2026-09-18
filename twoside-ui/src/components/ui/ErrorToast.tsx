import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="absolute top-6 left-4 right-4 z-30 flex items-center justify-between gap-3 bg-surface/95 backdrop-blur-md border border-red-500/30 shadow-2xl shadow-red-950/40 px-4 py-3 rounded-2xl transition duration-200">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-[#F87171]" strokeWidth={2} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground leading-tight">
            {message}
          </span>
        </div>
      </div>
      <button
        type="button"
        aria-label="Dismiss alert"
        onClick={onDismiss}
        className="text-muted hover:text-foreground p-1 -mr-1 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}