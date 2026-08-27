"use client";

import { useState, useEffect } from "react";
import { AccountBalance, TransactionType } from "@/lib/types";
import { api } from "@/lib/api";
import BalanceCarousel from "@/components/modules/BalanceCarousel";
import TransactionFormModal from "@/components/modules/TransactionForm"; 
import Navbar from "@/components/BottomNav";
import ActionSelectorSheet from "@/components/modules/ActionSelectorSheet";
import TransactionsFeed from "@/components/modules/TransactionsFeed"; // <-- Import the feed

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  
  const [activeTab, setActiveTab] = useState("home");
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<TransactionType | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      try {
        const data = await api.getBalances();
        setAccounts(data.balances);
      } catch (err) {
        console.error("Failed to load balances", err);
      } finally {
        setLoadingAccounts(false);
      }
    }
    fetchBalances();
  }, []);

  return (
    <div className="min-h-screen relative pb-28">
      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {activeTab === "home" && (
          <>
            {loadingAccounts ? (
              <div className="bg-surface/80 border border-white/5 rounded-2xl p-6 text-center text-muted text-xs animate-pulse">
                Loading accounts...
              </div>
            ) : (
              <BalanceCarousel accounts={accounts} />
            )}

            {/* Transactions Feed right on the home screen below balances */}
            <div className="pt-2 border-t border-white/5">
              <TransactionsFeed />
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="pt-2">
            {/* You can also render TransactionsFeed here if you want a dedicated history tab later */}
            <TransactionsFeed />
          </div>
        )}
      </div>

      {/* Bottom Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenActionSheet={() => setIsActionSheetOpen(true)}
      />

      {/* Action Selector Sheet */}
      <ActionSelectorSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelectType={(type) => {
          setIsActionSheetOpen(false);
          setActiveModalType(type);
        }}
      />

      {/* Specific Transaction Form Modal */}
      {activeModalType && (
        <TransactionFormModal
          isOpen={!!activeModalType}
          onClose={() => setActiveModalType(null)}
          accounts={accounts}
          initialType={activeModalType || "expense"}
        />
      )}
    </div>
  );
}