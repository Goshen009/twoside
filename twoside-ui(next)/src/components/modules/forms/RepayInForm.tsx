"use client";

import { useState } from "react";
import { Plus, Trash2, Wallet, Calendar, FileText, ChevronRight, ArrowDownLeft, Search } from "lucide-react";
import { AccountBalance } from "@/lib/types";
import SelectSheet from "@/components/modules/SelectSheet";

interface SplitDestination {
  id: string;
  accountId: string;
  amount: string;
}

interface RepayInFormProps {
  accounts: AccountBalance[];
  onClose: () => void;
}

const MOCK_ACTIVE_LOANS = [
  { id: "l1", counterparty: "John Doe", description: "Emergency support", amount: 50000, date: "2026-08-10" },
  { id: "l2", counterparty: "Sarah Williams", description: "Gadget purchase support", amount: 120000, date: "2026-08-15" },
];

export default function RepayInForm({ accounts, onClose }: RepayInFormProps) {
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splits, setSplits] = useState<SplitDestination[]>([
    { id: "1", accountId: accounts[0]?.id || "", amount: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activePicker, setActivePicker] = useState<"loan" | "account" | null>(null);
  const [targetSplitId, setTargetSplitId] = useState<string | null>(null);
  const [loanSearchQuery, setLoanSearchQuery] = useState("");

  const totalAmount = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const selectedLoan = MOCK_ACTIVE_LOANS.find((l) => l.id === selectedLoanId);

  const handleAddSplit = () => {
    setSplits([...splits, { id: Math.random().toString(), accountId: accounts[0]?.id || "", amount: "" }]);
  };

  const handleRemoveSplit = (id: string) => {
    if (splits.length === 1) return;
    setSplits(splits.filter((s) => s.id !== id));
  };

  const updateSplitAmount = (id: string, amount: string) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, amount } : s)));
  };

  const updateSplitAccount = (id: string, accountId: string) => {
    setSplits(splits.map((s) => (s.id === id ? { ...s, accountId } : s)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  const formatDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Loan Selector Field */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Select Loan to Repay</label>
        <button
          type="button"
          onClick={() => {
            setActivePicker("loan");
            setLoanSearchQuery("");
          }}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
        >
          <div className="flex items-center gap-2 truncate">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-zinc-100 truncate">
              {selectedLoan ? `${selectedLoan.counterparty} — ₦${selectedLoan.amount.toLocaleString()} (${selectedLoan.description})` : "Select active loan..."}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
        </button>
      </div>

      {/* Description Field (Full Width) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Description / Note</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="e.g., First installment refund..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Date Field Only (Full Width) */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 w-3.5 h-3.5 text-muted pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Split Destinations Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Destination Accounts & Amounts</label>
          <button
            type="button"
            onClick={handleAddSplit}
            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Split Destination
          </button>
        </div>

        <div className="space-y-2">
          {splits.map((split) => {
            const selectedAccount = accounts.find((a) => a.id === split.accountId);
            return (
              <div key={split.id} className="flex items-center gap-2.5 bg-black/20 border border-white/5 p-2.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setTargetSplitId(split.id);
                    setActivePicker("account");
                  }}
                  className="flex-1 flex items-center gap-2 bg-surface/90 border border-white/5 px-3 py-2.5 rounded-xl text-left hover:border-primary/30 transition-all truncate shadow-sm"
                >
                  <Wallet className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span className="text-xs text-zinc-200 truncate">
                    {selectedAccount ? selectedAccount.name : "Select account"}
                  </span>
                </button>

                <div className="w-32 relative">
                  <span className="absolute left-3 top-3 text-xs text-muted">₦</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={split.amount}
                    onChange={(e) => updateSplitAmount(split.id, e.target.value)}
                    required
                    className="w-full bg-surface/90 border border-white/5 rounded-xl pl-6 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50 font-mono shadow-sm"
                  />
                </div>

                {splits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSplit(split.id)}
                    className="p-2 text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Summary Row */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface/60 border border-white/5 font-mono text-xs">
          <span className="text-muted text-[10px] uppercase tracking-wider">Total Repayment In</span>
          <span className="font-bold text-emerald-400">
            ₦{totalAmount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-primary text-black font-semibold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2"
      >
        {isSubmitting ? "Saving..." : "Save Repay In"}
      </button>

      {/* SelectSheet for Accounts */}
      <SelectSheet
        isOpen={activePicker === "account"}
        onClose={() => {
          setActivePicker(null);
          setTargetSplitId(null);
        }}
        title="Select Account"
        items={accounts.map(acc => ({
          ...acc,
          name: `${acc.name} (₦${Number(acc.balance).toLocaleString("en-NG")})`
        }))}
        selectedId={targetSplitId ? splits.find(s => s.id === targetSplitId)?.accountId : undefined}
        onSelect={(id) => {
          const originalId = accounts.find(acc => `${acc.name} (₦${Number(acc.balance).toLocaleString("en-NG")})` === id)?.id || id;
          if (targetSplitId) {
            updateSplitAccount(targetSplitId, originalId);
          }
          setActivePicker(null);
          setTargetSplitId(null);
        }}
      />

      {/* Custom Slide-Up Sheet for Loan Selection with detailed row layout */}
      {activePicker === "loan" && (
        <div className="absolute inset-0 z-50 bg-surface/95 backdrop-blur-md rounded-3xl p-4 flex flex-col space-y-3 border border-white/10 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search active loans..."
                value={loanSearchQuery}
                onChange={(e) => setLoanSearchQuery(e.target.value)}
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
            {MOCK_ACTIVE_LOANS.filter(
              (l) =>
                l.counterparty.toLowerCase().includes(loanSearchQuery.toLowerCase()) ||
                l.description.toLowerCase().includes(loanSearchQuery.toLowerCase())
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setSelectedLoanId(l.id);
                  setActivePicker(null);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="space-y-0.5 pr-2 truncate">
                  <div className="text-xs font-medium text-zinc-200">{l.counterparty}</div>
                  <div className="text-[10px] text-muted truncate">{l.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-emerald-400 font-semibold">
                    ₦{l.amount.toLocaleString("en-NG")}
                  </div>
                  <div className="text-[10px] font-mono text-muted">
                    {formatDateString(l.date)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}