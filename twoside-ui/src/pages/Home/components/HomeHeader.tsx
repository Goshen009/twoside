import { Settings } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

export function HomeHeader({ onSettingsClick }: { onSettingsClick: () => void }) {
  const username = useUserStore((s) => s.data?.username);

  return (
    <header className="px-1 pt-2 pb-3 flex items-center justify-between">
      {!username ? (
        <div className="h-7 w-32 rounded-md bg-surface-hover animate-pulse" />
      ) : (
        <h1 className="text-xl font-bold tracking-tight text-foreground">Hi {username},</h1>
      )}
      <button
        type="button"
        aria-label="Settings"
        onClick={onSettingsClick}
        className="-mr-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
      >
        <Settings className="h-5 w-5" />
      </button>
    </header>
  );
}