import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, MessageSquareText, TextCursorInput, type LucideIcon } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useTransactionsStore } from "@/stores/useTransactionsStore";
import { RecordForm } from "./RecordForm";
import { BottomPanel } from "@/components/BottomPanel";

type Mode = "form" | "type";

const panelVariants = {
  enter: (dir: 1 | -1) => ({ x: dir * 50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ x: dir * -50, opacity: 0 }),
};

interface AddTransactionFlowProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionFlow({ open, onClose }: AddTransactionFlowProps) {
  return (
    <BottomPanel open={open} onClose={onClose}>
      {open && <FlowPanel onClose={onClose} />}
    </BottomPanel>
  );
}

function FlowPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const direction: 1 | -1 = mode ? 1 : -1;

  function handleSaved() {
    onClose();
    // silent refetches: card total + tag list, and the (still filtered) list
    useUserStore.getState().refetch();
    useTransactionsStore.getState().refetch();
  }

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={mode ?? "picker"}
        custom={direction}
        variants={panelVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="flex min-h-0 flex-1 flex-col"
      >
        {mode === null && <ModePicker onChoose={setMode} />}

        {mode === "form" && (
          <>
            <FlowHeader title="Log a Spend" onBack={() => setMode(null)} />
            <RecordForm onSaved={handleSaved} />
          </>
        )}

        {mode === "type" && (
          <>
            <FlowHeader title="Type It" onBack={() => setMode(null)} />
            <p className="px-5 py-10 text-center text-sm text-muted">Coming next.</p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function FlowHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-5 py-2">
      <button
        type="button"
        aria-label="Back"
        onClick={onBack}
        className="-ml-1 p-1 text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h2 className="text-md font-semibold tracking-tight text-foreground">{title}</h2>
    </header>
  );
}

function ModePicker({ onChoose }: { onChoose: (m: Mode) => void }) {
  return (
    <>
      <header className="flex shrink-0 items-center px-6 py-3">
        <h2 className="text-md font-semibold tracking-tight text-foreground">New Spend</h2>
      </header>
      <div className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-1">
        <ModeOption
          icon={TextCursorInput}
          label="Use a form"
          description="Fill in the description, amount, day and tag"
          onClick={() => onChoose("form")}
        />
        <ModeOption
          icon={MessageSquareText}
          label="Type it"
          description={'Just write it, like "Bought bread for 5k"'}
          onClick={() => onChoose("type")}
        />
      </div>
    </>
  );
}

function ModeOption({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl border border-picker-border bg-picker-background p-3 text-left transition-transform active:bg-picker-surface-hover"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs font-semibold leading-tight text-foreground">{label}</div>
          <div className="mt-0.5 text-2xs text-muted">{description}</div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted" />
    </button>
  );
}