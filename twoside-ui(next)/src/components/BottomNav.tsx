"use client";

import { Home, ArrowLeftRight, Plus } from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenActionSheet: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenActionSheet }: NavbarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/85 backdrop-blur-xl border-t border-white/5 px-6 py-3 flex items-center justify-between max-w-md mx-auto">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab("home")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === "home" ? "text-primary" : "text-muted hover:text-zinc-200"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      {/* Central Floating Plus Action Button */}
      <button
        type="button"
        onClick={onOpenActionSheet}
        className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all -mt-5 border-4 border-background cursor-pointer pointer-events-auto"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* History Tab */}
      <button
        onClick={() => setActiveTab("history")}
        className={`flex flex-col items-center gap-1 transition-colors ${
          activeTab === "history" ? "text-primary" : "text-muted hover:text-zinc-200"
        }`}
      >
        <ArrowLeftRight className="w-5 h-5" />
        <span className="text-[10px] font-medium">History</span>
      </button>
    </div>
  );
}