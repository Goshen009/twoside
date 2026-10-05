import type { ReactNode } from "react";

export const FIELD_LABEL = "text-xs font-semibold tracking-wider text-muted";

export function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className={`block px-1 ${FIELD_LABEL}`}>
        {label}
        {hint && <span className="ml-1 text-2xs font-normal normal-case text-muted/70">{hint}</span>}
      </span>
      {children}
    </div>
  );
}