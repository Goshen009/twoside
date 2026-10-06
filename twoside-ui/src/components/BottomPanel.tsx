import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BottomPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomPanel({ open, onClose, children }: BottomPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <div key="panel" className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
            }}
            className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl border-t border-border bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.7)]"
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}