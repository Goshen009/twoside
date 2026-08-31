import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  HandCoins,
  Landmark,
  ArrowRightLeft,
  CreditCard,
} from "lucide-react";
import type { TransactionType } from "@/lib/types";

export const TRANSACTION_TYPE_META: Record<
  TransactionType,
  { icon: typeof ArrowUpRight; bg: string; color: string; label: string }
> = {
  expense: { icon: ArrowUpRight, bg: "bg-rose-500/10 border-rose-500/20", color: "text-rose-400", label: "Expense" },
  income: { icon: ArrowDownLeft, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-400", label: "Income" },
  transfer: { icon: ArrowLeftRight, bg: "bg-sky-500/10 border-sky-500/20", color: "text-sky-400", label: "Transfer" },
  loan_given: { icon: HandCoins, bg: "bg-purple-500/10 border-purple-500/20", color: "text-purple-400", label: "Give Loan" },
  loan_borrowed: { icon: Landmark, bg: "bg-amber-500/10 border-amber-500/20", color: "text-amber-400", label: "Borrow" },
  loan_repay_received: { icon: ArrowRightLeft, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-400", label: "Receive Repayment" },
  loan_repay_paid: { icon: CreditCard, bg: "bg-rose-500/10 border-rose-500/20", color: "text-rose-400", label: "Repay Loan" },
};