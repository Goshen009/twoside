import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  hint?: React.ReactNode; // optional extra under the message, e.g. an arrow
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/5" />
        <span className="absolute inset-3 rounded-full bg-primary/10" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-surface text-primary shadow-lg shadow-primary/10">
          <Icon className="h-6 w-6" />
        </span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mx-auto max-w-[16rem] text-xs leading-relaxed text-muted">{message}</p>
      </div>

      {/*{hint}*/}
    </div>
  );
}