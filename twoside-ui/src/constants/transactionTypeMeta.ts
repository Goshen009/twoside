import {
  ArrowLeftRight,
  BanknoteArrowDown,
  BanknoteArrowUp,
  HandCoins,
  Handshake,
  Receipt,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { TransactionLogType } from "@/types/types";

export interface TransactionTypeMeta {
  icon: LucideIcon,
  label: string,
  description: string,
  bg: string,
  text: string,
  group: "core" | "loans",
}

export const TRANSACTION_TYPE_META: Record<TransactionLogType, TransactionTypeMeta> = {
  EXPENSE: {
    icon: Receipt,
    label: "Expense",
    description: "Spend from an account",
    bg: "bg-expense/15",
    text: "text-expense",
    group: "core",
  },
  INCOME: {
    icon: TrendingUp,
    label: "Income",
    description: "Receive into an account",
    bg: "bg-income/15",
    text: "text-income",
    group: "core",
  },
  TRANSFER: {
    icon: ArrowLeftRight,
    label: "Transfer",
    description: "Move between your accounts",
    bg: "bg-transfer/15",
    text: "text-transfer",
    group: "core",
  },
  GIVE_LOAN: {
    icon: HandCoins,
    label: "Lending",
    description: "Lend money to someone",
    bg: "bg-give-loan/15",
    text: "text-give-loan",
    group: "loans",
  },
  BORROW: {
    icon: Handshake,
    label: "Borrowing",
    description: "Take money from someone",
    bg: "bg-borrow/15",
    text: "text-borrow",
    group: "loans",
  },
  REPAY_LOAN: {
    icon: BanknoteArrowUp,
    label: "Debt Repayment",
    description: "Pay back money you borrowed",
    bg: "bg-repay-loan/15",
    text: "text-repay-loan",
    group: "loans",
  },
  RECEIVE_REPAYMENT: {
    icon: BanknoteArrowDown,
    label: "Loan Repayment",
    description: "Collect money you lent",
    bg: "bg-receive-repayment/15",
    text: "text-receive-repayment",
    group: "loans",
  },
} as const;