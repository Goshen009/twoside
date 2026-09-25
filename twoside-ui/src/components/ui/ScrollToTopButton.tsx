import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

interface ScrollToTopButtonProps {
  visible: boolean;
}

export function ScrollToTopButton({ visible }: ScrollToTopButtonProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          type="button"
          aria-label="Scroll to top"
          initial={{ y: 15, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 15, opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface/90 text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm active:scale-95 transition-transform"
        >
          <ArrowUp className="h-4.5 w-4.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}