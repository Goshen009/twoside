import type { InputHTMLAttributes, ReactNode, Ref } from "react";
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

// --- App-wide info cache (GET /info) ---

export type InfoAccount = { id: string; name: string; balance: number };
export type InfoCategory = { id: string; name: string };
export type InfoCounterparty = { id: string; name: string };

export type LoanDirection = "GIVEN" | "BORROWED";
export type InfoLoanStatus = "OPEN" | "PARTIALLY_REPAID"; // /info never returns CLOSED

export type InfoLoan = {
  id: string;
  amount: number; // wire number
  status: InfoLoanStatus;
  direction: LoanDirection;
  date_issued: string; // ISO string; Date parsing deferred to a later format helper
  counterparty_id: string;
  counterparty_name: string;
  total_repaid: number; // wire number
};

export type InfoData = {
  currency: string; // "₦"
  IANA: string; // "Africa/Lagos"
  accounts: InfoAccount[];
  categories: InfoCategory[];
  counterparties: InfoCounterparty[];
  open_loans: InfoLoan[];
};

export type InfoContextValue = {
  data: InfoData | null; // null = not loaded / logged out
  loading: boolean; // true only when no data yet and a fetch is in flight
  is_refreshing: boolean; // true when a background refetch runs while data present
  error: string | null;
  refetch: () => Promise<void>; // never rejects; folds failures into `error`
};

// --- Transaction forms ---

export type LogExpenseSource = { account_id: string; amount: number };
export type LogExpensePayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  category_name: string | null;
  sources: LogExpenseSource[];
  bypass_warnings: string[];
};

export type PickerItem = { id: string; name: string; subtitle?: string };

export type PickerSheetProps = {
  open: boolean;
  title: string;
  items: PickerItem[];
  selected_id?: string | null;
  on_select: (id: string) => void;
  on_close: () => void;
  show_none?: boolean;
  none_label?: string;
  on_none?: () => void;
  show_create?: boolean;
  create_label?: string;
  create_placeholder?: string;
  on_create?: (name: string) => void;
  search_placeholder?: string;
  empty_message?: string;
};

export type PendingWarning = { code: string; message: string };

export type WarningToastProps = {
  message: string;
  on_close: () => void;
};

export type TextFieldProps = {
  label?: string;
  error?: string;
  ref?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export type DateTimeFieldProps = TextFieldProps;

export type AllocationRowData = {
  key: string;
  account_id: string;
  amount: string;
};

export type AllocationsListProps = {
  label: string;
  helper_text?: string;
  add_label: string;
  total_label: string;
  rows: AllocationRowData[];
  accounts: InfoAccount[];
  currency: string;
  accent_color?: string;
  total: number;
  on_add: () => void;
  on_remove: (index: number) => void;
  on_account_click: (index: number) => void;
  on_amount_change: (index: number, value: string) => void;
  root_error?: string;
  row_error?: (index: number, key: "account_id" | "amount") => string | undefined;
};

export type ExpenseFormProps = {
  on_success: () => void;
};

export type ExpensePickerTarget =
  | { kind: "account"; row_index: number }
  | { kind: "category" };
