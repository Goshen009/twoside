import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore } from "@/stores/useUIStore";
import { Eye, EyeOff } from "lucide-react";

import Format from "@/lib/Format";
import Constants from "@/lib/Constants";

interface AccountBalanceCardProps {
  onAccountChange: (account_id: string | null) => void;
}

const SWIPE_THRESHOLD = 50;

export function AccountBalanceCard({ onAccountChange }: AccountBalanceCardProps) {
  const accounts = useUserStore((state) => state.data?.accounts);
  const total_balance = useUserStore((state) => state.data?.total_balance);
  const currency_symbol = useUserStore((state) => state.data?.currency_symbol);
  const is_fetching = useUserStore((state) => state.is_fetching);

  const is_hidden = useUIStore((state) => state.is_amounts_hidden);
  const toggleAmountsHidden = useUIStore((state) => state.toggleAmountsHidden);

  const [active_index, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Tell HomePage which account is selected on mount, and whenever accounts
  // first become available (both start us on "All Accounts").
  useEffect(() => {
    onAccountChange(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (is_fetching && !accounts) {
    return (
      <section className="bg-surface rounded-3xl p-5 border border-border h-38 animate-pulse" />
    );
  }

  const display_accounts = [
    { id: Constants.ALL_ACCOUNTS_ID, name: "All Accounts", balance: total_balance ?? 0 },
    ...(accounts ?? []),
  ];

  const account = display_accounts[active_index] ?? display_accounts[0];
  const { whole, decimal } = Format.money(account.balance, currency_symbol ?? "");

  function goToIndex(next_index: number, dir: 1 | -1) {
    setDirection(dir);
    setActiveIndex(next_index);
    const selected = display_accounts[next_index];
    onAccountChange(selected.id === Constants.ALL_ACCOUNTS_ID ? null : selected.id);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const count = display_accounts.length;
    if (info.offset.x < -SWIPE_THRESHOLD) {
      goToIndex((active_index + 1) % count, 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      goToIndex((active_index - 1 + count) % count, -1);
    }
  }

  const balanceVariants = {
    enter: (dir: 1 | -1) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: dir * -40, opacity: 0 }),
  };

  return (
    <motion.section
      aria-label="Account Balance"
      className="bg-surface rounded-3xl p-5 border border-border shadow-lg relative overflow-hidden cursor-grab active:cursor-grabbing"
      drag={display_accounts.length > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-end mb-1">
        <button
          type="button"
          aria-label="Toggle balance visibility"
          onClick={toggleAmountsHidden}
          className="text-muted hover:text-foreground p-1 rounded-full hover:bg-white/5 transition-colors"
        >
          {is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <div className="text-center pb-2 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={account.id}
            custom={direction}
            variants={balanceVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <p className="text-sm text-foreground/80 font-medium tracking-wide mb-1.5">
              {account.name}
            </p>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {is_hidden ? (
                  "••••••"
                ) : (
                  <>
                    {whole}
                    <span className="text-foreground/60">.{decimal}</span>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {display_accounts.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {display_accounts.map((a, i) => (
              <div
                key={a.id}
                className={`h-1.5 rounded-full transition-all ${
                  i === active_index ? "w-4 bg-primary" : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}