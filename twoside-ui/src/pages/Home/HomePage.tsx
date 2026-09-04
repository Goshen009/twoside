import { useAuth } from "@/hooks/useAuth";

export function HomePage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-xs text-muted">You're in. Welcome to twoside.</p>
      <button
        type="button"
        onClick={logout}
        className="text-[11px] text-primary hover:underline cursor-pointer"
      >
        Log out
      </button>
    </div>
  );
}
