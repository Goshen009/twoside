import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TRANSACTION_TYPE_META } from "@/constants/transactions";
import { useAddTransactionFlow } from "@/hooks/useAddTransactionFlow";
import { Sheet } from "@/components/ui/Sheet";
import { TypeSelectorSheet } from "@/components/transactions/TypeSelectorSheet";
import { TransactionFormView } from "@/components/transactions/TransactionFormView";
import type { TransactionType } from "@/types/types";

type StageDirection = "forward" | "back";

const ENTER_SHIFT = 56;
const EXIT_SHIFT = 24;

export function AddTransactionFlow() {
  const { is_open, stage, transaction_type, close, select_type, back_to_types } =
    useAddTransactionFlow();
  const [direction, set_direction] = useState<StageDirection>("forward");
  const reduce_motion = useReducedMotion() ?? false;

  const content_key =
    stage === "type_select" ? "types" : `form-${transaction_type ?? "none"}`;
  const shift = reduce_motion ? 0 : ENTER_SHIFT;

  function handle_select_type(selected_type: TransactionType): void {
    set_direction("forward");
    select_type(selected_type);
  }

  function handle_back(): void {
    set_direction("back");
    back_to_types();
  }

  const title =
    stage === "form" && transaction_type
      ? TRANSACTION_TYPE_META[transaction_type].label
      : "New Transaction";

  return (
    <Sheet
      open={is_open}
      on_close={close}
      on_back={stage === "form" ? handle_back : null}
      title={title}
    >
      <div className="overflow-x-clip">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={content_key}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={{
              enter: (dir: StageDirection) => ({
                x: dir === "forward" ? shift : -shift,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
                transition: {
                  duration: reduce_motion ? 0 : 0.22,
                  ease: "easeOut",
                },
              },
              exit: (dir: StageDirection) => ({
                x: dir === "forward" ? -EXIT_SHIFT : EXIT_SHIFT,
                opacity: 0,
                transition: {
                  duration: reduce_motion ? 0 : 0.12,
                  ease: "easeIn",
                },
              }),
            }}
          >
            {stage === "type_select" ? (
              <TypeSelectorSheet on_select_type={handle_select_type} />
            ) : transaction_type ? (
              <TransactionFormView
                key={transaction_type}
                transaction_type={transaction_type}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}
