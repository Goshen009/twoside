import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

type WarningToastProps = {
  message: string;
  on_close: () => void;
};

export default function WarningToast({ message, on_close }: WarningToastProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={on_close}
        className="bg-amber-950/60 border border-amber-500/20 backdrop-blur-xl rounded-xl px-3 py-2.5 shadow-[0_4px_16px_rgba(245,158,11,0.08)] flex items-center gap-2.5 text-amber-200 cursor-pointer"
      >
        <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h4 className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider leading-tight">Warning</h4>
          <p className="text-[11px] font-medium leading-tight text-amber-200/90 break-words mt-0.5">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); on_close(); }}
          className="p-1 rounded-lg text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/10 transition-colors shrink-0 -mr-1"
          aria-label="Dismiss warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
