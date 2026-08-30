"use client";

import { X, Plus } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface SelectSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: OptionItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  showClearOption?: boolean;
  onClear?: () => void;
  showAddOption?: boolean;
  onAddClick?: () => void;
  addLabel?: string;
}

export default function SelectSheet({
  isOpen,
  onClose,
  title,
  items,
  selectedId,
  onSelect,
  showClearOption = false,
  onClear,
  showAddOption = false,
  onAddClick,
  addLabel = "Add new",
}: SelectSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 transition-all duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Body */}
      <div
        className={`relative w-full max-w-md bg-surface border-t border-x border-white/10 rounded-t-3xl p-5 space-y-4 shadow-2xl transition-all duration-300 ease-out transform ${
          isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-98"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Items List (Max height keeps it compact) */}
        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {showClearOption && (
            <button
              onClick={() => {
                onClear?.();
                onClose();
              }}
              className="w-full p-3 rounded-xl bg-black/10 border border-white/5 flex items-center justify-between text-muted hover:text-zinc-100 hover:bg-white/5 transition-all text-xs font-medium cursor-pointer"
            >
              <span>None / Clear Selection</span>
            </button>
          )}

          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary/40 text-zinc-100"
                    : "bg-black/20 border-white/5 text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span className="text-xs font-semibold">{item.name}</span>
                </div>
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        {/* Optional Add Button right inside sheet */}
        {showAddOption && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                onAddClick?.();
              }}
              className="w-full py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{addLabel}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}