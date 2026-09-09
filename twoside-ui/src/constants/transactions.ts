import {
  ArrowLeftRight,
  BanknoteArrowDown,
  BanknoteArrowUp,
  HandCoins,
  Handshake,
  Receipt,
  TrendingUp,
} from "lucide-react";
import type {
  TransactionLogType,
  TransactionType,
  TransactionTypeMeta,
} from "@/types/types";

export const TRANSACTION_TYPE_META: Record<TransactionType, TransactionTypeMeta> = {
  expense: {
    icon: Receipt,
    label: "Expense",
    description: "Spend from an account",
    accent: "#fb7185",
    group: "core",
  },
  income: {
    icon: TrendingUp,
    label: "Income",
    description: "Receive into an account",
    accent: "#4ade80",
    group: "core",
  },
  transfer: {
    icon: ArrowLeftRight,
    label: "Transfer",
    description: "Move between your accounts",
    accent: "#60a5fa",
    group: "core",
  },
  give_loan: {
    icon: HandCoins,
    label: "Give Loan",
    description: "Lend money to someone",
    accent: "#fbbf24",
    group: "loans",
  },
  borrow: {
    icon: Handshake,
    label: "Borrow",
    description: "Take money from someone",
    accent: "#a78bfa",
    group: "loans",
  },
  repay_loan: {
    icon: BanknoteArrowUp,
    label: "Repay Loan",
    description: "Pay back money you borrowed",
    accent: "#fb923c",
    group: "loans",
  },
  receive_repayment: {
    icon: BanknoteArrowDown,
    label: "Receive Repayment",
    description: "Collect money you lent",
    accent: "#34d399",
    group: "loans",
  },
};

export const CORE_TRANSACTION_TYPES: TransactionType[] = [
  "expense",
  "income",
  "transfer",
];

export const LOAN_TRANSACTION_TYPES: TransactionType[] = [
  "give_loan",
  "borrow",
  "repay_loan",
  "receive_repayment",
];

/** Feed/journal `log_type` (uppercase wire values) → add-transaction meta key.
 *  Lets the listing reuse the same icon/accent/label as the composer so a log
 *  type reads consistently everywhere. */
export const LOG_TYPE_TO_TRANSACTION_TYPE: Record<
  TransactionLogType,
  TransactionType
> = {
  EXPENSE: "expense",
  INCOME: "income",
  TRANSFER: "transfer",
  GIVE_LOAN: "give_loan",
  BORROW: "borrow",
  REPAY_LOAN: "repay_loan",
  RECEIVE_REPAYMENT: "receive_repayment",
};
