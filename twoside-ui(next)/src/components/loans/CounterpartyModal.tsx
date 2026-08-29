"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";

interface CounterpartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCounterparties: string[];
  selectedCounterparty: string;
  onSelect: (name: string) => void;
}

export function CounterpartyModal({
  isOpen,
  onClose,
  availableCounterparties,
  selectedCounterparty,
  onSelect,
}: CounterpartyModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 backdrop-blur-sm p-3 cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[70vh] flex flex-col cursor-default"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-zinc-100">Select Counterparty</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto pr-1">
          <button
            onClick={() => {
              onSelect("all");
              onClose();
            }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
              selectedCounterparty === "all"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
            }`}
          >
            <span>All Counterparties</span>
            {selectedCounterparty === "all" && <span className="w-2 h-2 rounded-full bg-primary" />}
          </button>

          {availableCounterparties.map((name) => (
            <button
              key={name}
              onClick={() => {
                onSelect(name);
                onClose();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                selectedCounterparty === name
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
              }`}
            >
              <span>{name}</span>
              {selectedCounterparty === name && <span className="w-2 h-2 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}