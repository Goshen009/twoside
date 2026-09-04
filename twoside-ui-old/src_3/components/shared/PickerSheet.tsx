import { X, Plus } from "lucide-react";

export type PickerItem = {
  id: string;
  name: string;
  subtitle?: string;
};

type PickerSheetProps = {
  is_open: boolean;
  title: string;
  items: PickerItem[];
  selected_id?: string | null;
  on_select: (id: string) => void;
  on_close: () => void;
  show_clear_option?: boolean;
  on_clear?: () => void;
  show_add_option?: boolean;
  add_label?: string;
  on_add_click?: () => void;
};

export default function PickerSheet({
  is_open, title, items, selected_id, on_select, on_close,
  show_clear_option = false, on_clear,
  show_add_option = false, add_label = "Add new", on_add_click,
}: PickerSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${
        is_open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0" onClick={on_close} />
      <div
        className={`relative w-full max-w-md bg-surface border-t border-x border-white/10 rounded-t-3xl p-5 space-y-4 shadow-2xl transition-all duration-300 ease-out transform ${
          is_open ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-98"
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
          <button onClick={on_close} className="p-2 rounded-xl text-muted hover:text-zinc-100 hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {show_clear_option && (
            <button
              onClick={() => { on_clear?.(); on_close(); }}
              className="w-full p-3 rounded-xl bg-black/10 border border-white/5 flex items-center justify-between text-muted hover:text-zinc-100 hover:bg-white/5 transition-all text-xs font-medium"
            >
              <span>None / Clear Selection</span>
            </button>
          )}
          {items.map((item) => {
            const is_selected = item.id === selected_id;
            return (
              <button
                key={item.id}
                onClick={() => { on_select(item.id); on_close(); }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                  is_selected ? "bg-primary/10 border-primary/40 text-zinc-100" : "bg-black/20 border-white/5 text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">{item.name}</span>
                  {item.subtitle && <span className="text-[10px] text-muted font-mono">{item.subtitle}</span>}
                </div>
                {is_selected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        {show_add_option && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={on_add_click}
              className="w-full py-3 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex items-center justify-center gap-2 text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{add_label}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}