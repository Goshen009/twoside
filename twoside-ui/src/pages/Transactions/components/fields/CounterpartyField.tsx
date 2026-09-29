import { useState } from "react";
import { User } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useFormAccent } from "@/hooks/useFormAccent";
import { FormField } from "./FormField";
import { PickerTrigger } from "./PickerTrigger";
import { PickerSheet } from "../pickers/PickerSheet";

interface CounterpartyFieldProps {
  label: string; // "Lent To" | "Borrowed From"
  value: string | null; // counterparty NAME
  onChange: (name: string) => void;
}

export function CounterpartyField({ label, value, onChange }: CounterpartyFieldProps) {
  const [open, setOpen] = useState(false);
  const accent = useFormAccent();
  const people = useUserStore((s) => s.data?.counterparties)?.filter((c) => c.is_active) ?? [];

  return (
    <FormField label={label}>
      <PickerTrigger icon={User} value={value} placeholder="Select or add a person" onClick={() => setOpen(true)} />
      <PickerSheet
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        accent={accent}
        selected_id={value}
        onSelect={onChange}
        items={people.map((p) => ({ id: p.name, name: p.name }))}
        create={{ label: "Add New Person", placeholder: "Name", onCreate: onChange }}
      />
    </FormField>
  );
}