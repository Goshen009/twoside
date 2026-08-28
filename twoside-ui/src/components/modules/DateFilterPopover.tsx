"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, X, Check, RotateCcw } from "lucide-react";

interface DateFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPreset: string;
  onSelectPreset: (preset: string) => void;
  jumpDate: string;
  onJumpDateChange: (date: string) => void;
  onReset: () => void;
}

export default function DateFilterPopover({
  isOpen,
  onClose,
  selectedPreset,
  onSelectPreset,
  jumpDate,
  onJumpDateChange,
  onReset,
}: DateFilterPopoverProps) {
  const presets = [
    { id: "all", label: "All Time" },
    { id: "this_month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "last_30", label: "Last 30 Days" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Popover Sheet / Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm bg-surface border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-100">Filter Transactions</span>
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-muted hover:text-zinc-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const isSelected = selectedPreset === preset.id && !jumpDate;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        onSelectPreset(preset.id);
                        onJumpDateChange(""); // Clear single date jump when preset chosen
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all ${
                        isSelected
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-black/30 border-white/5 text-zinc-300 hover:border-white/10"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jump to Specific Day */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Jump to Specific Day</span>
              <div className="relative">
                <input
                  type="date"
                  value={jumpDate}
                  onChange={(e) => {
                    onJumpDateChange(e.target.value);
                    onSelectPreset(""); // Clear preset when jumping to exact day
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-zinc-100 transition-colors py-1 px-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-primary text-background font-medium text-xs hover:opacity-90 transition-opacity"
              >
                Apply Filter
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}