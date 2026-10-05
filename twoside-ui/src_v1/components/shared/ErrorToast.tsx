import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ErrorToastProps {
  message: string;
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ErrorToast({ message, onDismiss, actionLabel, onAction, className }: ErrorToastProps) {
  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={
        className ??
        "absolute top-6 left-4 right-4 z-30 flex items-center justify-between gap-3 bg-surface/95 backdrop-blur-md border border-red-500/30 shadow-2xl shadow-red-950/40 px-4 py-3 rounded-2xl"
      }
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-rose" strokeWidth={2} />
        </div>
        <span className="text-xs font-semibold text-foreground leading-tight">
          {message}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={onDismiss}
          className="text-muted hover:text-foreground p-1 -mr-1 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}