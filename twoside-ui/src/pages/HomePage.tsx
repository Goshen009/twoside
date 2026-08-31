import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Wallet } from "lucide-react";
import { useAccounts } from "../hooks/useAccounts";
import type { TransactionType } from "@/lib/types";
import Balances from "@/components/home/Balances";
import TransactionsFeed from "@/components/home/TransactionsFeed";
import Navbar from "@/components/shared/Navbar";
import TransactionTypeSheet from "@/components/transactions/TransactionTypeSheet";
import TransactionFormModal from "@/components/home/TransactionFormModal";

export default function HomeScreen() {
  const { accounts, net_total, loading: loading_accounts } = useAccounts();

  const [active_tab, set_active_tab] = useState<"home" | "history">("home");
  const [selected_account_id, set_selected_account_id] = useState<string>("all");
  const [is_action_sheet_open, set_is_action_sheet_open] = useState(false);
  const [active_modal_type, set_active_modal_type] = useState<TransactionType | null>(null);
  const [is_carousel_visible, set_is_carousel_visible] = useState(true);

  const carousel_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        set_is_carousel_visible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    const current_ref = carousel_ref.current;
    if (current_ref) observer.observe(current_ref);
    return () => {
      if (current_ref) observer.unobserve(current_ref);
    };
  }, [loading_accounts, active_tab]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const is_all_selected = !selected_account_id || selected_account_id === "all";
  const active_account = accounts.find((acc) => acc.id === selected_account_id);
  const sticky_name = is_all_selected ? "All Accounts" : active_account?.name || "Account";

  return (
    <div className="min-h-screen relative pb-28">
      <AnimatePresence>
        {!is_carousel_visible && active_tab === "home" && (
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
              <span className="text-xs font-medium text-zinc-200 truncate">{sticky_name}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4 max-w-xl mx-auto">
        {active_tab === "home" && (
          <>
            {loading_accounts ? (
              <div className="bg-surface/80 border border-white/5 rounded-2xl p-6 text-center text-muted text-xs animate-pulse">
                Loading accounts...
              </div>
            ) : (
              <div ref={carousel_ref}>
                <Balances accounts={accounts} net_total={net_total} onSelectAccount={set_selected_account_id} />
              </div>
            )}
            <div className="pt-2 border-t border-white/5">
              <TransactionsFeed selected_account_id={selected_account_id} />
            </div>
          </>
        )}
        {active_tab === "history" && (
          <div className="pt-2">
            <TransactionsFeed selected_account_id={selected_account_id} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {!is_carousel_visible && (
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

      <Navbar
        active_tab={active_tab}
        set_active_tab={(tab) => set_active_tab(tab as "home" | "history")}
        on_open_action_sheet={() => set_is_action_sheet_open(true)}
      />

      <TransactionTypeSheet
        is_open={is_action_sheet_open}
        on_close={() => set_is_action_sheet_open(false)}
        on_select_type={(type) => {
          set_is_action_sheet_open(false);
          set_active_modal_type(type);
        }}
      />

      {active_modal_type && (
        <TransactionFormModal
          isOpen={!!active_modal_type}
          onClose={() => set_active_modal_type(null)}
          accounts={accounts}
          initialType={active_modal_type}
        />
      )}
    </div>
  );
}