"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useBalances } from "@/hooks/useBalances";

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(n);
}

const SWIPE_THRESHOLD = 40;
const SWIPE_VELOCITY = 300;

export function AccountCarousel() {
  const { data, loading } = useBalances();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);

  if (loading || !data || data.balances.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-[11px] text-muted-foreground">
        Loading accounts…
      </div>
    );
  }

  const accounts = data.balances;
  const current = accounts[index];

  function go(newDirection: number) {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + accounts.length) % accounts.length);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY) go(-1);
    // Prevent the click handler firing right after a drag
    setTimeout(() => { didDrag.current = false; }, 0);
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    if (didDrag.current) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) go(-1);
    else go(1);
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div
        ref={cardRef}
        className="relative w-full overflow-hidden rounded-2xl border border-border bg-card"
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current.account_id}
            custom={direction}
            initial={{ x: direction >= 0 ? 60 : -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction >= 0 ? -60 : 60, opacity: 0, position: "absolute" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragStart={() => { didDrag.current = true; }}
            onDragEnd={handleDragEnd}
            onClick={handleTap}
            className="flex flex-col items-center justify-center gap-1.5 py-6 px-4 w-full cursor-pointer select-none"
          >
            <div className="text-sm font-medium tracking-wide text-muted-foreground">
              {current.name}
            </div>
            <div className="text-3xl font-bold tabular-nums text-foreground">
              {formatAmount(current.balance)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {accounts.map((acc, i) => (
          <button
            key={acc.account_id}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"
            }`}
            aria-label={`Go to ${acc.name}`}
          />
        ))}
      </div>
    </div>
  );
}