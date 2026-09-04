import { NavLink } from "react-router-dom";
import { ArrowLeftRight, HandCoins, Home, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAddTransactionFlow } from "@/hooks/useAddTransactionFlow";

function navClassName(is_active: boolean): string {
  return `flex flex-col items-center gap-1 transition-colors ${
    is_active ? "text-primary" : "text-muted hover:text-foreground"
  }`;
}

export function AppNavbar() {
  const { logout } = useAuth();
  const { open } = useAddTransactionFlow();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto flex max-w-md items-center justify-between border-t border-white/5 bg-surface/85 px-4 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <NavLink
          to="/"
          end
          className={({ isActive }) => navClassName(isActive)}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink
          to="/loans"
          className={({ isActive }) => navClassName(isActive)}
        >
          <HandCoins className="h-5 w-5" />
          <span className="text-[10px] font-medium">Loans</span>
        </NavLink>

        <button
          type="button"
          aria-label="Add transaction"
          onClick={open}
          className="-mt-5 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-4 border-background bg-primary text-background shadow-lg shadow-primary/30 transition-transform duration-150 hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <div className="flex cursor-default select-none flex-col items-center gap-1 text-muted">
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-[10px] font-medium">History</span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex cursor-pointer flex-col items-center gap-1 text-muted transition-colors hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-medium">Log out</span>
        </button>
      </div>
    </nav>
  );
}
