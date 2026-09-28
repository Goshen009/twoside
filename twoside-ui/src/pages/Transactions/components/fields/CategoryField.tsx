import { ChevronDown, Tag } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { FormField } from "./FormField";

interface CategoryFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  const categories = useUserStore((s) => s.data?.categories)?.filter((c) => c.is_active) ?? [];

  return (
    <FormField label="Category" hint="(Optional)">
      <div className="relative flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2.5">
        <Tag className="h-3 w-3 shrink-0 text-muted" />
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex-1 appearance-none bg-transparent pr-6 text-xs font-medium text-foreground outline-none"
        >
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-muted" />
      </div>
    </FormField>
  );
}