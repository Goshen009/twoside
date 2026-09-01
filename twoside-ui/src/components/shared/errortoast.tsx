import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

type ErrorToastProps = {
  message: string;
  on_close?: () => void;
  duration?: number;
};

export default function ErrorToast({ message, on_close, duration = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (!duration || !on_close) return;
    const timer = setTimeout(on_close, duration);
    return () => clearTimeout(timer);
  }, [duration, on_close]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-red-950/60 border border-red-500/20 backdrop-blur-xl rounded-xl px-3 py-2.5 shadow-[0_4px_16px_rgba(239,68,68,0.08)] flex items-center gap-2.5 text-red-200"
      >
        <div className="w-5 h-5 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h4 className="text-[10px] font-semibold text-red-300 uppercase tracking-wider leading-tight">Warning</h4>
          <p className="text-[11px] font-medium leading-tight text-red-200/90 break-words mt-0.5">
            {message}
          </p>
        </div>
        {on_close && (
          <button
            type="button"
            onClick={on_close}
            className="p-1 rounded-lg text-red-400/70 hover:text-red-200 hover:bg-red-500/10 transition-colors shrink-0 -mr-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}