import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type AuthContextValue = {
  is_authenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type AmbientToken = {
  symbol: string;
  top: string;
  left?: string;
  right?: string;
  duration: number;
  delay: number;
};

export type PageTransitionProps = {
  children: ReactNode;
};

// --- Transaction flow ---

export type TransactionGroup = "core" | "loans";

export type TransactionType =
  | "expense"
  | "income"
  | "transfer"
  | "give_loan"
  | "borrow"
  | "repay_loan"
  | "receive_repayment";

export type TransactionTypeMeta = {
  icon: LucideIcon;
  label: string;
  description: string;
  accent: string;
  group: TransactionGroup;
};

export type AddTransactionFlowStage = "type_select" | "form";

export type AddTransactionFlowContextValue = {
  is_open: boolean;
  stage: AddTransactionFlowStage;
  transaction_type: TransactionType | null;
  open: () => void;
  close: () => void;
  select_type: (transaction_type: TransactionType) => void;
  back_to_types: () => void;
};

export type TransactionFormViewProps = {
  transaction_type: TransactionType;
};

export type SheetProps = {
  open: boolean;
  on_close: () => void;
  on_back?: (() => void) | null;
  title: string;
  children: ReactNode;
};
