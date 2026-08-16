import { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

interface PickerItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface Props {
  title: string;
  items: PickerItem[];
  onSelect: (id: string) => void;
  onClose: () => void;
  onCreate?: (name: string) => Promise<void>;
  createLabel?: string;
}

export function PickerSheet({ title, items, onSelect, onClose, onCreate, createLabel }: Props) {
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState('');

  const filtered = items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!newValue.trim() || !onCreate) return;
    await onCreate(newValue.trim());
    setNewValue('');
    setAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl border-t border-border bg-card px-4 pb-8 pt-4 shadow-xl"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>

        {adding ? (
          <>
            <input
              autoFocus
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`e.g. ${createLabel ?? 'New item'}`}
              className="h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={!newValue.trim()}
              onClick={handleCreate}
              className="mt-4 h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Add {createLabel}
            </button>
          </>
        ) : (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="rounded-xl px-3 py-3 text-left text-sm text-foreground hover:bg-secondary"
                >
                  {item.label}
                  {item.sublabel && <span className="ml-2 text-xs text-muted-foreground">{item.sublabel}</span>}
                </button>
              ))}
            </div>
            {onCreate && (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="mt-2 flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-3 text-sm font-medium"
              >
                <Plus className="size-4" /> Add {createLabel}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}