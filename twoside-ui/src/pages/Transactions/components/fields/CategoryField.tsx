import { useState } from "react";
import { Tag } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useFormAccent } from "@/hooks/useFormAccent";
import { FormField } from "./FormField";
import { PickerTrigger } from "./PickerTrigger";
import { PickerSheet } from "../pickers/PickerSheet";

interface CategoryFieldProps {
  value: string | null; // category NAME
  onChange: (name: string | null) => void;
}

export function CategoryField({ value, onChange }: CategoryFieldProps) {
  const [open, setOpen] = useState(false);
  const accent = useFormAccent();
  const categories = useUserStore((s) => s.data?.categories)?.filter((c) => c.is_active) ?? [];

  return (
    <FormField label="Category" hint="(Optional)">
      <PickerTrigger icon={Tag} value={value} placeholder="None" onClick={() => setOpen(true)} />
      <PickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Select Category"
        accent={accent}
        selected_id={value}
        onSelect={onChange}
        items={categories.map((c) => ({ id: c.name, name: c.name }))}
        none_label="None"
        onNone={() => onChange(null)}
        create={{ label: "Create New Category", placeholder: "Category name", onCreate: onChange }}
      />
    </FormField>
  );
}