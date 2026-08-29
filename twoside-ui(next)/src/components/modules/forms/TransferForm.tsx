"use client";

import { useState } from "react";
import { Wallet, Search, Calendar, ArrowRightLeft } from "lucide-react";
import { AccountBalance } from "@/lib/types";

interface TransferFormProps {
  accounts: AccountBalance[];
  onClose: () => void;
}

export default function TransferForm({ accounts, onClose }: TransferFormProps) {
  const [title, setTitle] = useState(""); // <-- Added title state
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Picker Sheet State ("from" | "to" | null)
  const [activePicker, setActivePicker] = useState<"from" | "to" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toAccount = accounts.find((a) => a.id === toAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      alert("Source and destination accounts cannot be the same.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      
      {/* Description Field */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Description</label>
        <input
          type="text"
          placeholder="e.g., Transfer to savings, ATM withdrawal..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* From Account & To Account Selection */}
      <div className="space-y-3">
        {/* From Account */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">From Account (Source)</label>
          <button
            type="button"
            onClick={() => { setActivePicker("from"); setSearchQuery(""); }}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Wallet className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-zinc-100 truncate">
                {fromAccount ? `${fromAccount.name} (₦${Number(fromAccount.balance).toLocaleString()})` : "Select source account"}
              </span>
            </div>
          </button>
        </div>

        {/* Swap / Directional Indicator */}
        <div className="flex justify-center -my-1 relative z-10">
          <div className="w-7 h-7 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted shadow-sm">
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400 rotate-95" />
          </div>
        </div>

        {/* To Account */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">To Account (Destination)</label>
          <button
            type="button"
            onClick={() => { setActivePicker("to"); setSearchQuery(""); }}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Wallet className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="text-zinc-100 truncate">
                {toAccount ? `${toAccount.name} (₦${Number(toAccount.balance).toLocaleString()})` : "Select destination account"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Amount & Date Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-xs text-muted">₦</span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-6 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface/60 border border-white/5 font-mono text-xs">
        <span className="text-muted text-[10px] uppercase tracking-wider">Transfer Amount</span>
        <span className="font-bold text-sky-400">
          ₦{(Number(amount) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2"
      >
        {isSubmitting ? "Processing..." : "Complete Transfer"}
      </button>

      {/* ACCOUNT PICKER BOTTOM SHEET */}
      {activePicker && (
        <div className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md rounded-3xl p-4 flex flex-col space-y-3 border border-white/10 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-muted focus:outline-none focus:border-primary/50"
              />
            </div>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              className="text-xs font-medium text-muted hover:text-zinc-100 px-2 py-2"
            >
              Cancel
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {accounts
              .filter((acc) => acc.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    if (activePicker === "from") setFromAccountId(acc.id);
                    if (activePicker === "to") setToAccountId(acc.id);
                    setActivePicker(null);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-xs font-medium text-zinc-200">{acc.name}</span>
                  <span className="text-[11px] font-mono text-muted">
                    ₦{Number(acc.balance).toLocaleString("en-NG")}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </form>
  );
}