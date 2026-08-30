"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Wallet, Search, Check, Calendar } from "lucide-react";
import { AccountBalance } from "@/lib/types";
import SelectSheet from "@/components/modules/SelectSheet";

interface SplitSource {
  id: string;
  accountId: string;
  amount: string;
}

interface ExpenseFormProps {
  accounts: AccountBalance[];
  onClose: () => void;
}

// Mock categories for demonstration
const MOCK_CATEGORIES = ["Food & Dining", "Groceries", "Transport", "Utilities", "Subscriptions"];

export default function ExpenseForm({ accounts, onClose }: ExpenseFormProps) {
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splits, setSplits] = useState<SplitSource[]>([
    { id: "1", accountId: accounts[0]?.id || "", amount: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Picker Sheet State ("account" | "category" | null)
  const [activePicker, setActivePicker] = useState<"account" | "category" | null>(null);
  const [targetSplitId, setTargetSplitId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>(MOCK_CATEGORIES);

  const totalAmount = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

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

  const handleAddNewCategory = (catName: string) => {
    const formatted = catName.trim();
    if (!formatted) return;
    if (!customCategories.includes(formatted)) {
      setCustomCategories([...customCategories, formatted]);
    }
    setSelectedCategory(formatted);
    setActivePicker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      
      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Description</label>
        <input
          type="text"
          placeholder="e.g., Grocery run, Coffee..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-muted/50 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Category & Date Side-by-Side */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Category (Optional)</label>
          <button
            type="button"
            onClick={() => setActivePicker("category")}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-left flex items-center justify-between hover:border-primary/40 transition-all truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className={`truncate ${selectedCategory ? "text-zinc-100" : "text-muted/50"}`}>
                {selectedCategory || "Select category"}
              </span>
            </div>
          </button>
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

      {/* Split Sources Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <label className="text-[10px] font-mono text-muted uppercase tracking-wider">Source Accounts & Amounts</label>
          <button
            type="button"
            onClick={handleAddSplit}
            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Split Source
          </button>
        </div>

        <div className="space-y-2">
          {splits.map((split) => {
            const selectedAccount = accounts.find((a) => a.id === split.accountId);
            return (
              <div key={split.id} className="flex items-center gap-2.5 bg-black/20 border border-white/5 p-2.5 rounded-2xl">
                {/* Account Trigger */}
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

                {/* Amount Input */}
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
          <span className="text-muted text-[10px] uppercase tracking-wider">Total Expense</span>
          <span className="font-bold text-zinc-100">
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
        {isSubmitting ? "Saving..." : "Save Expense"}
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

      {/* SelectSheet for Categories */}
      <SelectSheet
        isOpen={activePicker === "category"}
        onClose={() => setActivePicker(null)}
        title="Select Category"
        items={customCategories.map(cat => ({ id: cat, name: cat }))}
        selectedId={selectedCategory}
        onSelect={(id) => {
          setSelectedCategory(id);
          setActivePicker(null);
        }}
        showClearOption={true}
        onClear={() => {
          setSelectedCategory("");
          setActivePicker(null);
        }}
        showAddOption={true}
        addLabel="Create new category"
        onAddClick={() => {
          setActivePicker(null);
          const categoryName = prompt("Enter new category name:");
          if (categoryName) {
            handleAddNewCategory(categoryName);
          }
        }}
      />
    </form>
  );
}