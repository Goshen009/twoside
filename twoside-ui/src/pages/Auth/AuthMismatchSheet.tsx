import { motion, AnimatePresence } from "framer-motion";

interface AuthMismatchSheetProps {
  is_open: boolean;
  title: string;
  message: string;
  confirm_label: string;
  cancel_label: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AuthMismatchSheet({
  is_open,
  title,
  message,
  confirm_label,
  cancel_label,
  loading = false,
  onConfirm,
  onCancel,
}: AuthMismatchSheetProps) {
  return (
    <AnimatePresence>
      {is_open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border rounded-t-3xl px-6 pt-6 pb-8"
          >
            <div className="w-10 h-1 bg-muted/30 rounded-full mx-auto mb-5" />

            <h2 className="text-base font-bold text-foreground text-center mb-2">
              {title}
            </h2>
            <p className="text-xs text-muted text-center leading-relaxed mb-6 max-w-xs mx-auto">
              {message}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className="w-full h-11 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-xs rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transition duration-150 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "One moment..." : confirm_label}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="w-full h-11 bg-transparent text-muted hover:text-foreground font-medium text-xs rounded-full flex items-center justify-center transition duration-150 ease-in-out cursor-pointer disabled:opacity-50"
              >
                {cancel_label}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}