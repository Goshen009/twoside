import type { ReactNode } from "react";
import { TopographicHeader } from "@/components/layout/TopographicHeader";
import { BrandEmblem } from "@/components/ui/BrandEmblem";
import { ErrorToast } from "@/components/ui/ErrorToast";

interface AuthShellProps {
  headline: string;
  children: ReactNode;
  is_error?: boolean;
  error_message?: string;
}

export function AuthShell({
  headline,
  children,
  is_error = false,
  error_message = "An error occurred. Please try again",
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {is_error && <ErrorToast message={error_message} />}

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