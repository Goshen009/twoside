import type { ReactNode } from "react";
import { AnimatePresence } from "framer-motion";

import { TopographicHeader } from "@/pages/Auth/TopographicHeader";
import { BrandEmblem } from "@/components/shared/BrandEmblem";
import { ErrorToast } from "@/components/shared/ErrorToast";

interface AuthShellProps {
  headline: string;
  children: ReactNode;
  is_error?: boolean;
  error_message?: string;
  onDismissError: () => void;
}

export function AuthShell({
  headline,
  children,
  is_error = false,
  error_message = "An error occurred. Please try again",
  onDismissError
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AnimatePresence>
        {is_error && (
          <ErrorToast key="error-toast" message={error_message} onDismiss={onDismissError} />
        )}
      </AnimatePresence>

      <TopographicHeader height={300} />

      <main className="relative px-6 pb-6 flex-1 flex flex-col items-center z-20">
        <div className="mb-4 -mt-7">
          <BrandEmblem is_error={is_error} />
        </div>

        <h1 className="text-lg font-bold text-foreground tracking-tight text-center mb-6">
          {headline}
        </h1>

        {children}
      </main>
    </div>
  );
}