"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Wallet } from "lucide-react";
import { AccountBalance, TransactionType } from "@/lib/types";
import { api } from "@/lib/api";
import BalanceCarousel from "@/components/modules/BalanceCarousel";
import TransactionFormModal from "@/components/modules/TransactionForm";
import Navbar from "@/components/BottomNav";
import ActionSelectorSheet from "@/components/modules/ActionSelectorSheet";
import TransactionsFeed from "@/components/modules/TransactionsFeed";

export default function HomeScreen() {
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Track currently selected account from the carousel ("all" or specific account ID)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>("all");

  const [activeTab, setActiveTab] = useState("home");
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [activeModalType, setActiveModalType] = useState<TransactionType | null>(null);

  // Visibility tracking for sticky elements
  const [isCarouselVisible, setIsCarouselVisible] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Intersection observer to check if the main carousel goes out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentRef = carouselRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loadingAccounts, activeTab]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate values for sticky header display
  const isAllSelected = !selectedAccountId || selectedAccountId === "all";
  const activeAccount = accounts.find((acc) => acc.id === selectedAccountId);

  const stickyName = isAllSelected ? "All Accounts" : activeAccount?.name || "Account";
  const stickyBalance = isAllSelected
    ? accounts.reduce((sum, acc) => sum + acc.balance, 0)
    : activeAccount?.balance ?? 0;

  return (
    <div className="min-h-screen relative pb-28">
      {/* 1. Slim Sticky Top Bar (Appears when scrolled down) */}
      <AnimatePresence>
        {!isCarouselVisible && activeTab === "home" && (
          <motion.div
            initial={{ y: -15, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -15, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl bg-surface/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] px-4 py-2.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-muted shrink-0">
                <Wallet className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium text-zinc-200 truncate">{stickyName}</span>
            </div>
      
            {/*<div className="text-xs font-mono font-semibold text-zinc-100 shrink-0">
              ₦{stickyBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </div>*/}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {activeTab === "home" && (
          <>
            {loadingAccounts ? (
              <div className="bg-surface/80 border border-white/5 rounded-2xl p-6 text-center text-muted text-xs animate-pulse">
                Loading accounts...
              </div>
            ) : (
              <div ref={carouselRef}>
                <BalanceCarousel
                  accounts={accounts}
                  onSelectAccount={setSelectedAccountId}
                />
              </div>
            )}

            {/* Transactions Feed linked to the carousel selection */}
            <div className="pt-2 border-t border-white/5">
              <TransactionsFeed selectedAccountId={selectedAccountId} />
            </div>
          </>
        )}

        {activeTab === "history" && (
          <div className="pt-2">
            <TransactionsFeed selectedAccountId={selectedAccountId} />
          </div>
        )}
      </div>

      {/* 2. Floating Jump-to-Top Button */}
      <AnimatePresence>
        {!isCarouselVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-5 z-40 p-3 rounded-2xl bg-primary text-background shadow-xl border border-white/20 flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Jump to top"
          >
            <ChevronUp className="w-5 h-5 font-bold" />
          </motion.button>
        )}
      </AnimatePresence>

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