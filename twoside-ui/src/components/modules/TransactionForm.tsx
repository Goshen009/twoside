"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { AccountBalance, TransactionType, ValidationErrorField } from "@/lib/types";
import { api } from "@/lib/api";

interface TransactionFormProps {
  accounts: AccountBalance[];
}

const TRANSACTION_TYPES: { id: TransactionType; label: string }[] = [
  { id: "expense", label: "Log Expense" },
  { id: "income", label: "Log Income" },
  { id: "transfer", label: "Log Transfer" },
  { id: "loan_given", label: "Log Loan Given" },
  { id: "loan_borrowed", label: "Log Borrowing" },
  { id: "loan_repay_received", label: "Log Loan Repayment Received" },
  { id: "loan_repay_paid", label: "Log Loan Repayment Paid" },
];

export default function TransactionForm({ accounts }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [trxDate, setTrxDate] = useState(new Date().toISOString().slice(0, 16));
  const [amount, setAmount] = useState("");
  
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.account_id || "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.account_id || "");
  const [destinationId, setDestinationId] = useState(accounts[0]?.account_id || "");
  const [sourceId, setSourceId] = useState(accounts[0]?.account_id || "");
  
  const [bypassWarnings, setBypassWarnings] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorField[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setGeneralError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      let payload: any = {
        description,
        trx_date: new Date(trxDate).toISOString(),
      };

      const numericAmount = parseFloat(amount);

      switch (activeTab) {
        case "transfer":
          payload = {
            ...payload,
            amount: numericAmount,
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            bypass_warnings: bypassWarnings,
          };
          break;
        case "income":
          payload = {
            ...payload,
            destinations: [{ account_id: destinationId, amount: numericAmount }],
          };
          break;
        case "expense":
          payload = {
            ...payload,
            sources: [{ account_id: sourceId, amount: numericAmount }],
            bypass_warnings: bypassWarnings,
          };
          break;
        default:
          payload = {
            ...payload,
            sources: [{ account_id: sourceId, amount: numericAmount }],
            bypass_warnings: bypassWarnings,
          };
      }

      await api.logTransaction(activeTab, payload);
      setSuccessMessage("Transaction recorded successfully!");
      setDescription("");
      setAmount("");
      setBypassWarnings(false);
    } catch (err: any) {
      if (err.fields) {
        setValidationErrors(err.fields);
      } else {
        setGeneralError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Header with Dropdown Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TransactionType)}
              className="appearance-none bg-background border border-border rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-primary cursor-pointer"
            >
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Description</label>
          <input
            type="text"
            maxLength={100}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Monthly internet subscription"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Date & Time</label>
          <input
            type="datetime-local"
            value={trxDate}
            onChange={(e) => setTrxDate(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Conditional Account Fields */}
        {activeTab === "transfer" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">From Account</label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary"
              >
                {accounts.map((a) => (
                  <option key={a.account_id} value={a.account_id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">To Account</label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary"
              >
                {accounts.map((a) => (
                  <option key={a.account_id} value={a.account_id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === "expense" && (
          <div>
            <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Source Account</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary"
            >
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>{a.name} (₦{a.balance})</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === "income" && (
          <div>
            <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Destination Account</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-primary"
            >
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>{a.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-[10px] text-muted uppercase tracking-wider mb-1">Amount (₦)</label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Warnings / Validation Errors */}
        {(validationErrors.length > 0 || generalError) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/90 font-medium">
                {generalError || "Please review the following warnings:"}
              </div>
            </div>
            {validationErrors.map((err, idx) => (
              <div key={idx} className="text-[10px] text-amber-300/80 pl-6 font-mono">
                • [{err.field}]: {err.message}
              </div>
            ))}
            <div className="pt-2 border-t border-amber-500/20 flex items-center gap-2 pl-6">
              <input
                type="checkbox"
                id="bypass"
                checked={bypassWarnings}
                onChange={(e) => setBypassWarnings(e.target.checked)}
                className="rounded border-amber-500/40 bg-background text-primary focus:ring-0 w-3.5 h-3.5"
              />
              <label htmlFor="bypass" className="text-[11px] text-amber-200 cursor-pointer font-medium">
                Bypass warnings & force transaction
              </label>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-primary text-[11px] font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover text-background font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Record Transaction</span>
        </button>
      </form>
    </div>
  );
}