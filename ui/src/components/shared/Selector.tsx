import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SelectorProps {
  value?: string;
  placeholder: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function Selector({ value, placeholder, icon: Icon, onClick }: SelectorProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-card px-3.5 text-left shadow-sm transition hover:border-primary/60 active:scale-[.99]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className={value ? 'truncate text-foreground' : 'text-muted-foreground'}>
          {value || placeholder}
        </span>
      </span>
      <ChevronDown className="size-4 text-muted-foreground" />
    </button>
  );
}