"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LogActionType } from "@/lib/types";

const ACTIONS: { value: LogActionType; label: string }[] = [
  { value: "transfer", label: "Transfer" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "loan_given", label: "Loan Given" },
  { value: "loan_borrowed", label: "Borrowed" },
  { value: "receive_repayment", label: "Receive Repayment" },
  { value: "repay_loan", label: "Repay Loan" },
];

export function QuickLogWidget() {
  const [active, setActive] = useState<LogActionType>("transfer");

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Tabs value={active} onValueChange={(v) => setActive(v as LogActionType)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {ACTIONS.map((a) => (
            <TabsTrigger key={a.value} value={a.value} className="text-[11px]">
              {a.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 relative min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {/* Placeholder — real forms come next */}
            <div className="text-[11px] text-muted-foreground">
              Form for &quot;{ACTIONS.find((a) => a.value === active)?.label}&quot; goes here.
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}