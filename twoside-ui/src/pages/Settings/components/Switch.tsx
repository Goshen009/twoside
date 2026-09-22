import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow"
        animate={{ x: checked ? 16 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
    </button>
  );
}