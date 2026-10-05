import { AnimatePresence, motion } from "framer-motion";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";

interface StickyAccountPillProps {
  visible: boolean;
  account_name: string;
}

export function StickyAccountPill({ visible, account_name }: StickyAccountPillProps) {
  const is_hidden = useUIStore((state) => state.is_amounts_hidden);
  const toggleAmountsHidden = useUIStore((state) => state.toggleAmountsHidden);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="account-pill"
          initial={{ y: -15, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -15, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed left-1/2 top-2 z-40 mx-auto flex w-[94%] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-surface/85 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-muted">
              <Wallet className="h-3 w-3" />
            </div>
            <span className="truncate text-xs font-medium text-foreground">
              {account_name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Toggle balance visibility"
            onClick={toggleAmountsHidden}
            className="text-muted hover:text-foreground p-1 rounded-full hover:bg-white/5 transition-colors shrink-0"
          >
            {is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}