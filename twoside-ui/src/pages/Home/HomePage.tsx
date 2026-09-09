import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Wallet } from "lucide-react";
import { useInfo } from "@/hooks/useInfo";
import { useTransactions } from "@/hooks/useTransactions";
import { Balances } from "./Balances";
import { TransactionsFeed } from "./TransactionsFeed";

export function HomePage() {
  const { data: info, loading: info_loading } = useInfo();
  const { filters, set_filters } = useTransactions();

  const accounts = useMemo(() => info?.accounts ?? [], [info]);
  const net_total = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const [is_carousel_visible, setIsCarouselVisible] = useState(true);
  const carousel_ref = useRef<HTMLDivElement>(null);

  // Once the balance card scrolls out of view, swap in a floating account pill
  // (top) and a jump-to-top button (bottom).
  useEffect(() => {
    const element = carousel_ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => setIsCarouselVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function handleSelectAccount(account_id: string | null): void {
    set_filters({ account_id });
  }

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const selected_account =
    accounts.find((account) => account.id === filters.account_id) ?? null;
  const sticky_name = selected_account?.name ?? "All Accounts";

  return (
    <div className="relative min-h-dvh pb-28">
      <AnimatePresence>
        {!is_carousel_visible ? (
          <motion.div
            key="account-pill"
            initial={{ y: -15, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -15, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-2 z-40 mx-auto flex w-[94%] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl border border-white/10 bg-surface/85 px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-muted">
                <Wallet className="h-3 w-3" />
              </div>
              <span className="truncate text-xs font-medium text-zinc-200">
                {sticky_name}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-4">
        <div ref={carousel_ref}>
          <Balances
            accounts={accounts}
            currency_symbol={info?.currency_symbol ?? "₦"}
            net_total={net_total}
            active_account_id={filters.account_id}
            loading={info_loading}
            on_select_account={handleSelectAccount}
          />
        </div>

        <div className="border-t border-white/5 pt-2">
          <TransactionsFeed />
        </div>
      </div>

      <AnimatePresence>
        {!is_carousel_visible ? (
          <motion.button
            key="jump-top"
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            aria-label="Jump to top"
            className="fixed bottom-24 right-5 z-40 flex cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-primary p-3 text-background shadow-xl transition-opacity hover:opacity-90"
          >
            <ChevronUp className="h-5 w-5 font-bold" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}