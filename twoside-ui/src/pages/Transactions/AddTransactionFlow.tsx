import { AnimatePresence, motion } from "framer-motion";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import { TransactionTypePicker } from "./components/TransactionTypePicker";
import { ExpenseForm } from "./forms/ExpenseForm";

const panelVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -50, opacity: 0 }),
};

export function AddTransactionFlow() {
  const is_open = useAddTransactionStore((s) => s.is_open);
  const selected_type = useAddTransactionStore((s) => s.selected_type);
  const close = useAddTransactionStore((s) => s.close);
  const direction: 1 | -1 = selected_type ? 1 : -1;

  return (
    <AnimatePresence>
      {is_open && (
        <div key="add-flow" className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            onClick={close}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                close();
              }
            }}
            className="relative flex w-full max-w-md max-h-[92dvh] flex-col overflow-hidden rounded-t-[32px] border-t border-border bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.7)]"
          >
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={selected_type ?? "picker"}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {selected_type === null ? (
                  <TransactionTypePicker />
                ) : selected_type === "EXPENSE" ? (
                  <ExpenseForm />
                ) : (
                  // <TransactionFormShell
                  //   log_type={selected_type}
                  //   title={Constants.TRANSACTION_TYPE_META[selected_type].label}
                  //   submit_label="Save"
                  //   can_submit={false}
                  //   onSubmit={() => {}}
                  // >
                  //   <p className="py-10 text-center text-sm text-muted">This form isn't built yet.</p>
                  // </TransactionFormShell>
                    <p className="py-10 text-center text-sm text-muted">This form isn't built yet.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}