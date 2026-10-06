import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirm_label?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirm_label = "Yes",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center px-6">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={loading ? undefined : onCancel}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-xs rounded-3xl border border-border bg-surface p-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{message}</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                No
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-background transition-opacity disabled:opacity-60 ${
                  danger ? "bg-rose" : "bg-primary"
                }`}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirm_label}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}