import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface SettingsRowProps {
  icon: ReactNode;
  label: string;
  trailing?: string;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
}

export function SettingsRow({ icon, label, trailing, to, onClick, danger = false }: SettingsRowProps) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`shrink-0 ${danger ? "text-red-400" : "text-muted"}`}>{icon}</div>
      <span className={`flex-1 text-xs font-medium ${danger ? "text-red-400" : "text-foreground"}`}>
        {label}
      </span>
      {trailing && <span className="text-[10px] text-muted">{trailing}</span>}
      {to && <ChevronRight className="w-4 h-4 text-muted" />}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block hover:bg-surface-hover transition-colors rounded-xl">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left hover:bg-surface-hover transition-colors rounded-xl cursor-pointer"
    >
      {content}
    </button>
  );
}