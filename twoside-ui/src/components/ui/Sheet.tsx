import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, X } from "lucide-react";
import type { SheetProps } from "@/types/types";

export function Sheet({ open, on_close, on_back, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const previous_overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous_overflow;
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={on_close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative mx-auto w-full max-w-md rounded-t-3xl border-t border-white/10 bg-surface shadow-[0_-12px_40px_rgba(0,0,0,0.5)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
          >
            <div className="relative flex h-14 items-center px-2">
              <div className="flex w-12 items-center justify-start">
                {on_back ? (
                  <button
                    type="button"
                    aria-label="Back"
                    onClick={on_back}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                ) : null}
              </div>
              <h2 className="flex-1 truncate text-center text-sm font-semibold text-foreground">
                {title}
              </h2>
              <div className="flex w-12 items-center justify-end">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={on_close}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[75dvh] overflow-y-auto px-5 pb-[calc(2rem_+_env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
