import { useMemo, useRef, useState, type TouchEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { FormatUtils } from "@/lib/FormatUtils";
import type { BalancesProps } from "@/types/types";

type BalanceCard = {
  id: string; // "all" for the combined card, else the account id
  name: string;
  balance: number;
};

const SWIPE_THRESHOLD_PX = 40;

/** Swipeable account-balance carousel. The first card is "All Accounts" (the
 *  summed net total); swiping picks an account, which filters the feed below.
 *  The current card is derived from `active_account_id` — the carousel only owns
 *  the swipe direction, and asks the parent to move the feed filter. */
export function Balances({
  accounts,
  currency_symbol,
  net_total,
  active_account_id,
  loading,
  on_select_account,
}: BalancesProps) {
  const cards = useMemo<BalanceCard[]>(
    () => [
      { id: "all", name: "All Accounts", balance: net_total },
      ...accounts,
    ],
    [accounts, net_total],
  );

  const [direction, setDirection] = useState<1 | -1>(1);
  const touch_start_x = useRef<number | null>(null);

  if (loading && accounts.length === 0) {
    return (
      <div className="h-40 animate-pulse rounded-3xl border border-white/5 bg-surface/60" />
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface/60 p-5 text-center text-xs text-muted">
        No accounts available.
      </div>
    );
  }

  const current_index = cards.findIndex(
    (card) => card.id === (active_account_id ?? "all"),
  );
  const safe_index = current_index === -1 ? 0 : current_index;
  const current_card = cards[safe_index];

  function goTo(next_index: number, dir: 1 | -1): void {
    const next_card = cards[next_index];
    if (!next_card || next_card.id === current_card.id) return;
    setDirection(dir);
    on_select_account(next_card.id === "all" ? null : next_card.id);
  }

  function handlePrev(): void {
    goTo(safe_index - 1 < 0 ? cards.length - 1 : safe_index - 1, -1);
  }

  function handleNext(): void {
    goTo(safe_index + 1 >= cards.length ? 0 : safe_index + 1, 1);
  }

  function handleTouchStart(event: TouchEvent): void {
    touch_start_x.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent): void {
    if (touch_start_x.current === null) return;
    const diff = touch_start_x.current - event.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD_PX) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touch_start_x.current = null;
  }

  const slide_variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative select-none overflow-hidden rounded-3xl p-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(20, 20, 24, 0.6) 0%, rgba(12, 12, 15, 0.7) 100%)",
        boxShadow:
          "0 15px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-inner">
            <Wallet className="h-3 w-3" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-200">
            {current_card.name}
          </span>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-muted">
          {safe_index + 1} / {cards.length}
        </div>
      </div>

      <div className="relative z-10 flex min-h-11 items-center overflow-hidden py-0.5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current_card.id}
            custom={direction}
            variants={slide_variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full font-mono text-2xl font-extrabold tracking-tight text-zinc-100"
          >
            {currency_symbol}
            {FormatUtils.formatMoney(current_card.balance)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 mt-1 flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-muted/60">
        <span>Swipe to switch accounts</span>
      </div>
    </div>
  );
}