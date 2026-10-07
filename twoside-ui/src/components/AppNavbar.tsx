import { NavLink } from "react-router-dom";
import { BarChart3, Home } from "lucide-react";

function navClassName(is_active: boolean): string {
  return `flex w-24 flex-col items-center gap-1 transition-colors ${
    is_active ? "text-primary" : "text-muted hover:text-foreground"
  }`;
}

export function AppNavbar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto flex max-w-md items-center justify-around border-t border-white/5 bg-surface/85 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <NavLink to="/home" end className={({ isActive }) => navClassName(isActive)}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink to="/insights" className={({ isActive }) => navClassName(isActive)}>
          <BarChart3 className="h-5 w-5" />
          <span className="text-[10px] font-medium">Insights</span>
        </NavLink>
      </div>
    </nav>
  );
}