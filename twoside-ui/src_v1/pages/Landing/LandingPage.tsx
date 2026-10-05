import { Navigate } from "react-router-dom";
import { useIsPWAMode } from "@/hooks/useIsPWAMode";
import { InstallPrompt } from "./InstallPrompt";

export function LandingPage() {
  const is_pwa_mode = useIsPWAMode();

  if (is_pwa_mode) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold text-center mb-3">twoside.</h1>
      <p className="text-sm text-muted text-center max-w-sm mb-8">
        Track where your money actually goes. Install the app to get started.
      </p>
      <InstallPrompt />
    </div>
  );
}