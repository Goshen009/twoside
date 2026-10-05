import { useFormAccent } from "@/hooks/useFormAccent";
import { PickerSheet } from "./PickerSheet";
import Format from "@/lib/Format";

interface AccountPickerSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  accounts: { id: string; name: string; balance: number }[];
  selected_id: string;
  disabled_ids?: string[];
  currency_symbol: string;
  onSelect: (id: string) => void;
}

export function AccountPickerSheet({ open, onClose, title = "Select Account", accounts, selected_id, disabled_ids = [], currency_symbol, onSelect }: AccountPickerSheetProps) {
  const accent = useFormAccent();
  const disabled = new Set(disabled_ids);

  return (
    <PickerSheet
      open={open}
      onClose={onClose}
      title={title}
      accent={accent}
      selected_id={selected_id}
      onSelect={onSelect}
      items={accounts.map((a) => ({
        id: a.id,
        name: a.name,
        subtitle: `Bal: ${Format.money(a.balance, currency_symbol).full}`,
        trailing: disabled.has(a.id) ? "Already used" : undefined,
        disabled: disabled.has(a.id),
      }))}
    />
  );
}