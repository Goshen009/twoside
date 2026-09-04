import React, { useRef, useState } from "react";
import { HandCoins, Landmark, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import Format from "@/libs/format";

interface LoansBalancesProps {
  total_lent: number;
  total_borrowed: number;
  count_lent: number;
  count_borrowed: number;
  active_direction: "LENT" | "BORROWED";
  onSelectDirection: (direction: "LENT" | "BORROWED") => void;
}

export function LoansBalances({ 
  total_lent, 
  total_borrowed, 
  count_lent,
  count_borrowed,
  active_direction, 
  onSelectDirection 
}: LoansBalancesProps) {
  const scroll_ref = useRef<HTMLDivElement>(null);

  const handle_scroll = () => {
    if (!scroll_ref.current) return;
    const scroll_left = scroll_ref.current.scrollLeft;
    const card_width = scroll_ref.current.offsetWidth * 0.88;
    const new_index = Math.round(scroll_left / card_width);
    if (new_index === 0 && active_direction !== "LENT") {
      onSelectDirection("LENT");
    } else if (new_index === 1 && active_direction !== "BORROWED") {
      onSelectDirection("BORROWED");
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Swipeable Carousel */}
      <div 
        ref={scroll_ref}
        onScroll={handle_scroll}
        className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1.5 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Card 1: What I'm Owed (LENT) */}
        <div 
          onClick={() => onSelectDirection("LENT")}
          className={`min-w-[88%] sm:min-w-[340px] snap-center bg-gradient-to-br from-surface via-surface/95 to-black/60 border rounded-3xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer group ${
            active_direction === "LENT" 
              ? "border-purple-500/40 shadow-[0_8px_30px_rgba(168,85,247,0.12)] ring-1 ring-purple-500/20" 
              : "border-white/5 opacity-70 hover:opacity-90"
          }`}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                <HandCoins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted block font-semibold">Receivables</span>
                <span className="text-xs font-semibold text-zinc-200">What I'm Owed</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium">
              {count_lent} active
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 tracking-tight">
              ₦{Format.formatMoney(total_lent)}
            </div>
            <div className="text-[11px] text-muted font-medium flex items-center gap-1.5 pt-0.5">
              <span>Swipe to view payables</span>
              <span className="text-purple-400">→</span>
            </div>
          </div>
        </div>

        {/* Card 2: What I Owe (BORROWED) */}
        <div 
          onClick={() => onSelectDirection("BORROWED")}
          className={`min-w-[88%] sm:min-w-[340px] snap-center bg-gradient-to-br from-surface via-surface/95 to-black/60 border rounded-3xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer group ${
            active_direction === "BORROWED" 
              ? "border-amber-500/40 shadow-[0_8px_30px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/20" 
              : "border-white/5 opacity-70 hover:opacity-90"
          }`}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted block font-semibold">Payables</span>
                <span className="text-xs font-semibold text-zinc-200">What I Owe</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
              {count_borrowed} active
            </span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-zinc-100 tracking-tight">
              ₦{Format.formatMoney(total_borrowed)}
            </div>
            <div className="text-[11px] text-muted font-medium flex items-center gap-1.5 pt-0.5">
              <span>← Swipe to view receivables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex justify-center items-center gap-2 pt-0.5">
        <button
          onClick={() => onSelectDirection("LENT")}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            active_direction === "LENT" ? "w-8 bg-purple-400 shadow-sm shadow-purple-400/50" : "w-1.5 bg-white/20 hover:bg-white/40"
          }`}
          aria-label="Switch to Receivables"
        />
        <button
          onClick={() => onSelectDirection("BORROWED")}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            active_direction === "BORROWED" ? "w-8 bg-amber-400 shadow-sm shadow-amber-400/50" : "w-1.5 bg-white/20 hover:bg-white/40"
          }`}
          aria-label="Switch to Payables"
        />
      </div>
    </div>
  );
}