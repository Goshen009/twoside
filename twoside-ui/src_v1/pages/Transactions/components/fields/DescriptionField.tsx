import { Pencil } from "lucide-react";
import { FormField } from "./FormField";

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  return (
    <FormField label="Description">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5 focus-within:border-(--form-accent)">
        <Pencil className="h-3 w-3 shrink-0 text-muted" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          maxLength={100}
          placeholder="What was this for?"
          className="flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted/60 placeholder:text-xs"
        />
      </div>
    </FormField>
  );
}