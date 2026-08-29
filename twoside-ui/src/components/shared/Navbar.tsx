import { Home, ArrowLeftRight, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";

type NavbarProps = {
  active_tab: string;
  set_active_tab: (tab: string) => void;
  on_open_action_sheet: () => void;
};

export default function Navbar({ active_tab, set_active_tab, on_open_action_sheet }: NavbarProps) {
  const { signOut } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-between max-w-md mx-auto">
      <button
        onClick={() => set_active_tab("home")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          active_tab === "home" ? "text-primary" : "text-muted hover:text-zinc-200"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button
        type="button"
        onClick={on_open_action_sheet}
        className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all -mt-5 border-4 border-background cursor-pointer pointer-events-auto"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      <button
        onClick={() => set_active_tab("history")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          active_tab === "history" ? "text-primary" : "text-muted hover:text-zinc-200"
        }`}
      >
        <ArrowLeftRight className="w-5 h-5" />
        <span className="text-[10px] font-medium">History</span>
      </button>

      <button
        onClick={() => signOut()}
        className="flex flex-col items-center gap-1 text-muted hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] font-medium">Logout</span>
      </button>
    </div>
  );
}