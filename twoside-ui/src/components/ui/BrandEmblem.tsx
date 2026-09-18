import type { ReactNode } from "react";

interface BrandEmblemProps {
  icon?: ReactNode;
  size?: number;
  is_error?: boolean;
}

export function BrandEmblem({ icon, size = 56, is_error = false }: BrandEmblemProps) {
  return (
    <div
      className={`flex items-center justify-center shadow-lg ring-4 ring-background rounded-full transition-colors duration-200 ${
        is_error ? "shadow-red-500/30" : "shadow-primary/25"
      }`}
    >
      <div
        className={`rounded-full flex items-center justify-center text-background transition-colors duration-200 active:scale-95 ${
          is_error ? "bg-[#EF4444]" : "bg-primary"
        }`}
        style={{ width: size, height: size }}
      >
        {icon}
      </div>
    </div>
  );
}