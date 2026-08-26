"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, Landmark, Settings } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/loans", label: "Loans", icon: Landmark },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-t border-border flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive ? "text-primary" : "text-muted hover:text-zinc-300"
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}