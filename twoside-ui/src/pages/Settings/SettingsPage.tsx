import { Link } from "react-router-dom";
import { Wallet, Tags, Users, LogOut, ChevronRight } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { SettingsRow } from "./components/SettingsRow";

export function SettingsPage() {
  const data = useUserStore((state) => state.data);
  const logout = useAuthStore((state) => state.logout);

  const initial = data?.currency_symbol ? "" : "";

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-28 app-container">
      <h1 className="text-lg font-bold text-foreground mb-6">Settings</h1>

      <Link
        to="/settings/profile"
        className="flex items-center gap-3 bg-surface border border-border rounded-2xl p-4 mb-6 hover:bg-surface-hover transition-colors"
      >
        <div className="w-11 h-11 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">Profile</p>
          <p className="text-[10px] text-muted truncate">
            {data?.currency_symbol} · {data?.iana_timezone}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted shrink-0" />
      </Link>

      <p className="text-[10px] font-medium text-muted uppercase tracking-wide mb-2 px-1">
        Manage
      </p>
      <div className="bg-surface border border-border rounded-2xl divide-y divide-border mb-6">
        <SettingsRow icon={<Wallet className="w-4 h-4" />} label="Accounts" to="/settings/accounts" />
        <SettingsRow icon={<Tags className="w-4 h-4" />} label="Categories" to="/settings/categories" />
        <SettingsRow icon={<Users className="w-4 h-4" />} label="Counterparties" to="/settings/counterparties" />
      </div>

      <p className="text-[10px] font-medium text-muted uppercase tracking-wide mb-2 px-1">
        Session
      </p>
      <div className="bg-surface border border-border rounded-2xl">
        <SettingsRow icon={<LogOut className="w-4 h-4" />} label="Log out" onClick={logout} danger />
      </div>
    </div>
  );
}