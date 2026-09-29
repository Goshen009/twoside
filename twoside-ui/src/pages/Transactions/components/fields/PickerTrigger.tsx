import { ChevronDown, type LucideIcon } from "lucide-react";

interface PickerTriggerProps {
  icon: LucideIcon;
  value: string | null;
  placeholder: string;
  onClick: () => void;
}

export function PickerTrigger({ icon: Icon, value, placeholder, onClick }: PickerTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-left transition-colors active:border-(--form-accent)"
    >
      <Icon className="h-3 w-3 shrink-0 text-muted" />
      <span className={`flex-1 truncate text-xs font-medium ${value ? "text-foreground" : "text-muted/60"}`}>
        {value ?? placeholder}
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}