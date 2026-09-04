import { AnimatePresence, motion } from "framer-motion";
import { Tag, X } from "lucide-react";
import { type Category } from "../../hooks/useCategories";


type CategoryPickerSheetProps = {
  is_open: boolean;
  categories: Category[];
  staged_category_id: string | null;
  on_select: (category_id: string | null) => void;
  on_close: () => void;
};

export default function CategoryPickerSheet({
  is_open,
  categories,
  staged_category_id,
  on_select,
  on_close,
}: CategoryPickerSheetProps) {
  return (
    <AnimatePresence>
      {is_open && (
        <div
          onClick={on_close}
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
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-zinc-100">Select Category</span>
              </div>
              <button
              	type="button"
                onClick={on_close}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 overflow-y-auto pr-1">
              <button
              	type="button"
                onClick={() => on_select(null)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  staged_category_id === null
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
                }`}
              >
                <span>All Categories</span>
                {staged_category_id === null && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
              {categories.map((cat) => (
                <button
                	type="button"
                  key={cat.id}
                  onClick={() => on_select(cat.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    staged_category_id === cat.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-black/20 text-zinc-300 hover:bg-white/5 border border-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {cat.name}
                    {!cat.is_active && (
                      <span className="text-[9px] uppercase tracking-wide text-muted/70 border border-white/10 rounded px-1 py-0.5">
                        inactive
                      </span>
                    )}
                  </span>
                  {staged_category_id === cat.id && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}