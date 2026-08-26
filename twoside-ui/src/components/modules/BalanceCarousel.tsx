"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { AccountBalance } from "@/lib/types";

interface BalanceCarouselProps {
  accounts: AccountBalance[];
}

export default function BalanceCarousel({ accounts }: BalanceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg text-center text-muted text-xs">
        No accounts available
      </div>
    );
  }

  const currentAccount = accounts[currentIndex];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? accounts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === accounts.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thirdWidth = rect.width / 3;

    if (clickX < thirdWidth) {
      handlePrev();
    } else if (clickX > rect.width - thirdWidth) {
      handleNext();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 25 : -25,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 25 : -25,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div 
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-surface border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden cursor-pointer select-none group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            {currentAccount.name} Account
          </span>
        </div>

        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5" onClick={(e) => e.stopPropagation()}>
          {/*<button 
            onClick={handlePrev}
            className="p-1 rounded hover:bg-surface text-muted hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>*/}
          <span className="text-[10px] text-muted px-1.5 font-mono">
            {currentIndex + 1}/{accounts.length}
          </span>
          {/*<button 
            onClick={handleNext}
            className="p-1 rounded hover:bg-surface text-muted hover:text-zinc-200 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>*/}
        </div>
      </div>

      <div className="overflow-hidden py-1 min-h-[52px] flex items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="text-3xl font-bold tracking-tight text-zinc-100 font-mono w-full"
          >
            ₦{Number(currentAccount.balance).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-[10px] text-muted flex items-center justify-between pt-3 border-t border-border">
        <span>Swipe or tap sides to switch accounts</span>
      </div>
    </div>
  );
}