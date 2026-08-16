import { NavLink } from 'react-router-dom';
import { Home, Landmark, Plus, ReceiptText, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/ledger', label: 'Ledger', icon: Landmark },
  { to: '/add', label: 'Add', icon: Plus },
  { to: '/budgets', label: 'Budgets', icon: ReceiptText },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export function Navbar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-14 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex size-8 items-center justify-center rounded-xl ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="size-4" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}