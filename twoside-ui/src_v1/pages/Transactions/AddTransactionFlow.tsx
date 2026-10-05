import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { useAddTransactionStore } from "@/stores/useAddTransactionStore";
import { NoteComposer } from "./NoteComposer";

export function AddTransactionFlow() {
  const is_open = useAddTransactionStore((s) => s.is_open);
  const close = useAddTransactionStore((s) => s.close);
  const controls = useDragControls();

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
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) close();
            }}
            className="relative flex h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-4xl border-t border-border bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.7)]"
          >
            {/* drag only from the handle, so the text input and scrolling don't fight the sheet */}
            <div
              className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <NoteComposer />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}