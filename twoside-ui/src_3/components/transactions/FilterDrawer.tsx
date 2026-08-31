import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, ChevronRight, RotateCcw, Tag } from "lucide-react";

import Format from "@/lib/format";

type FilterDrawerProps = {
  is_open: boolean;
  staged_from_date: string;
  staged_to_date: string;
  active_preset: "today" | "week" | "month" | "all" | null;
  staged_category_name: string;
  on_preset_select: (preset: "today" | "week" | "month" | "all") => void;
  on_from_date_change: (value: string) => void;
  on_to_date_change: (value: string) => void;
  on_open_category_picker: () => void;
  on_reset: () => void;
  on_apply: () => void;
};

export default function FilterDrawer({
  is_open,
  staged_from_date,
  staged_to_date,
  active_preset,
  staged_category_name,
  on_preset_select,
  on_from_date_change,
  on_to_date_change,
  on_open_category_picker,
  on_reset,
  on_apply,
}: FilterDrawerProps) {
  const from_date_ref = useRef<HTMLInputElement>(null);
  const to_date_ref = useRef<HTMLInputElement>(null);

  function openPicker(ref: React.RefObject<HTMLInputElement>) {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") ref.current.showPicker();
    else ref.current.click();
  }

  const presets: { key: "today" | "week" | "month" | "all"; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <AnimatePresence>
      {is_open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="bg-surface/90 border border-white/10 rounded-2xl p-3.5 space-y-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider shrink-0 mr-0.5">
                Presets:
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => on_preset_select(preset.key)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all shrink-0 ${
                    active_preset === preset.key
                      ? "bg-primary/20 border-primary/40 text-primary font-medium"
                      : "bg-black/30 border-white/5 text-zinc-300 hover:text-zinc-100 hover:border-white/10"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => openPicker(from_date_ref)}
                className="flex flex-col bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 hover:border-primary/40 transition-all cursor-pointer text-left"
              >
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted text-left">START</span>
                <div className="flex items-center justify-between text-xs text-zinc-200 mt-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    <span className="font-sans text-[11px] font-medium truncate">
                      {staged_from_date ? Format.formatDate(staged_from_date) : "No Date"}
                    </span>
                  </div>
                  <input
                    ref={from_date_ref}
                    type="date"
                    value={staged_from_date}
                    onChange={(e) => on_from_date_change(e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>

              <div
                onClick={() => openPicker(to_date_ref)}
                className="flex flex-col bg-black/30 border border-white/10 rounded-xl px-2.5 py-1.5 hover:border-primary/40 transition-all cursor-pointer text-right"
              >
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted text-right">END</span>
                <div className="flex items-center justify-end text-xs text-zinc-200 mt-0.5">
                  <input
                    ref={to_date_ref}
                    type="date"
                    value={staged_to_date}
                    onChange={(e) => on_to_date_change(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-sans text-[11px] font-medium truncate">
                      {staged_to_date ? Format.formatDate(staged_to_date) : "No Date"}
                    </span>
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={on_open_category_picker}
              className="w-full flex items-center justify-between bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{staged_category_name}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted" />
            </button>

            <div className="flex items-center gap-2 pt-1 border-t border-white/5">
              <button
                onClick={on_reset}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-zinc-300 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
              <button
                onClick={on_apply}
                className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 text-xs font-semibold text-background transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}