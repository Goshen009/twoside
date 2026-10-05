import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface BrandEmblemProps {
  icon?: ReactNode;
  size?: number;
  is_error?: boolean;
}

export function BrandEmblem({ icon, size = 56, is_error = false }: BrandEmblemProps) {
  return (
    <motion.div
      className="flex items-center justify-center shadow-lg ring-4 ring-background rounded-full"
      animate={{
        boxShadow: is_error
          ? "0 10px 25px -5px rgba(239, 68, 68, 0.3)"
          : "0 10px 25px -5px rgba(16, 185, 129, 0.25)",
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        className="rounded-full flex items-center justify-center text-background active:scale-95"
        style={{ width: size, height: size }}
        animate={{ backgroundColor: is_error ? "#EF4444" : "#10b981" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {icon}
      </motion.div>
    </motion.div>
  );
}