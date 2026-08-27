"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import { AccountBalance } from "@/lib/types";

interface BalanceCarouselProps {
  accounts: AccountBalance[];
  onSelectAccount?: (accountId: string | null) => void;
}

export default function BalanceCarousel({ accounts, onSelectAccount }: BalanceCarouselProps) {
  // Prepend an "All Accounts" pseudo-account item to the list
  const allAccountsCard = {
    id: "all",
    name: "All Accounts",
    balance: accounts.reduce((sum, a) => sum + Number(a.balance), 0),
    type: "ASSET" as const,
  };

  const combinedAccounts = [allAccountsCard, ...accounts];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const currentAccount = combinedAccounts[currentIndex];

  // Report the active account ID whenever it changes
  useEffect(() => {
    if (onSelectAccount) {
      onSelectAccount(currentAccount.id);
    }
  }, [currentIndex, currentAccount.id, onSelectAccount]);

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-surface/50 border border-white/5 rounded-2xl p-5 shadow-xl text-center text-muted text-xs">
        No accounts available
      </div>
    );
  }

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? combinedAccounts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === combinedAccounts.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thirdWidth = rect.width / 3;

    if (clickX < thirdWidth) handlePrev();
    else if (clickX > rect.width - thirdWidth) handleNext();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 20 : -20, opacity: 0 }),
  };

  return (
    <div 
      onClick={handleCardClick}
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
            {currentAccount.name}
          </span>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-lg px-2 py-0.5 text-[10px] text-muted font-mono" onClick={(e) => e.stopPropagation()}>
          {currentIndex + 1} / {combinedAccounts.length}
        </div>
      </div>

      <div className="overflow-hidden py-0.5 min-h-[46px] flex items-center relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="text-2xl font-extrabold tracking-tight text-zinc-100 font-mono w-full"
          >
            ₦{Number(currentAccount.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-muted/60 flex items-center justify-between pt-3 mt-1 border-t border-white/5 relative z-10">
        <span>Swipe card or tap edges to switch</span>
      </div>
    </div>
  );
}