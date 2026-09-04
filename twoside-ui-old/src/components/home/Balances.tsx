import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import Format from "../../libs/format";
import { type Account } from "../../hooks/useAccounts";

type BalanceCarouselProps = {
  accounts: Account[];
  net_total: number;
  onSelectAccount?: (account_id: string) => void;
};

export default function Balances({ accounts, net_total, onSelectAccount }: BalanceCarouselProps) {
	const all_accounts_card: Account = { id: "all", name: "All Accounts", balance: Format.toNumber(net_total), };
  const combined_accounts = [all_accounts_card, ...accounts];

  const [current_index, set_current_index] = useState(0);
  const [direction, set_direction] = useState(0);
  const touch_start_x = useRef<number | null>(null);
  const current_account = combined_accounts[current_index];

  useEffect(() => {
    onSelectAccount?.(current_account.id);
  }, [current_index, current_account.id, onSelectAccount]);

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-surface/50 border border-white/5 rounded-2xl p-5 shadow-xl text-center text-muted text-xs">
        No accounts available
      </div>
    );
  }

  function handlePrev() {
    set_direction(-1);
    set_current_index((prev) => (prev === 0 ? combined_accounts.length - 1 : prev - 1));
  }

  function handleNext() {
    set_direction(1);
    set_current_index((prev) => (prev === combined_accounts.length - 1 ? 0 : prev + 1));
  }

  function handleTouchStart(e: React.TouchEvent) {
    touch_start_x.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touch_start_x.current === null) return;
    const diff = touch_start_x.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touch_start_x.current = null;
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
 		<div
   		onTouchStart={handleTouchStart}
   		onTouchEnd={handleTouchEnd}
   		className="relative overflow-hidden rounded-3xl p-5 cursor-pointer select-none group transition-all duration-300"
   		style={{
     		background: "linear-gradient(135deg, rgba(20, 20, 24, 0.6) 0%, rgba(12, 12, 15, 0.7) 100%)",
     		boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
     		border: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
            <Wallet className="w-3 h-3" />
          </div>
          <span className="text-sm font-semibold text-zinc-200 tracking-wide">
            {current_account.name}
          </span>
        </div>
        <div
          className="bg-black/30 border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-muted font-mono"
          onClick={(e) => e.stopPropagation()}
        >
          {current_index + 1} / {combined_accounts.length}
        </div>
      </div>
      <div className="overflow-hidden py-0.5 min-h-11.5 flex items-center relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current_index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="text-2xl font-extrabold tracking-tight text-zinc-100 font-mono w-full"
          >
            ₦{Format.toNumber(current_account.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="text-[10px] text-muted/60 flex items-center justify-between pt-3 mt-1 border-t border-white/5 relative z-10">
        <span>Swipe to switch accounts</span>
      </div>
    </div>
  );
}