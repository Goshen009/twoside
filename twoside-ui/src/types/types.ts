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

export type TypeSelectorSheetProps = {
  on_select_type: (transaction_type: TransactionType) => void;
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
  currency_symbol: string; // "₦"
  iana_timezone: string; // "Africa/Lagos"
  accounts: InfoAccount[];
  categories: InfoCategory[];
  counterparties: InfoCounterparty[];
  total_you_are_owed: number; // wire number; net outstanding across GIVEN loans
  total_you_owe: number; // wire number; net outstanding across BORROWED loans
  open_loans: InfoLoan[];
};

export type InfoContextValue = {
  data: InfoData | null; // null = not loaded / logged out
  loading: boolean; // true only when no data yet and a fetch is in flight
  is_refreshing: boolean; // true when a background refetch runs while data present
  error: string | null;
  refetch: () => Promise<void>; // never rejects; folds failures into `error`
};

// --- Transaction feed (GET /accounts/transactions) ---

export type TransactionEntrySide = "DEBIT" | "CREDIT";
export type TransactionLogType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "GIVE_LOAN"
  | "BORROW"
  | "RECEIVE_REPAYMENT"
  | "REPAY_LOAN";

export type RelatedAccount = { id: string; name: string };
export type RelatedCounterparty = { id: string; name: string };

export type TransactionEntry = {
  account_id: string;
  account_name: string;
  is_active: boolean;
  entry_id: string; // stable React key
  side: TransactionEntrySide;
  amount: number; // wire number
  charge_amount: number | null; // wire number
  log_type: TransactionLogType;
  transaction_date: string; // ISO; Date parsing deferred to a later format helper
  date_logged: string; // ISO
  description: string;
  category_id: string | null;
  category_name: string | null;
  is_category_active: boolean | null;
  transaction_group_id: string;
  related_account?: RelatedAccount; // present when TRANSFER
  related_counterparty?: RelatedCounterparty | null; // present when group has loans
};

export type TransactionsPage = {
  entries: TransactionEntry[];
  next_cursor: string | null;
  has_next: boolean;
};

export type TransactionsFilters = {
  account_id: string | null;
  category_id: string | null;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
};

export type TransactionsListQuery = TransactionsFilters & {
  cursor?: string | null;
  limit: number;
};

export type TransactionsContextValue = {
  entries: TransactionEntry[];
  next_cursor: string | null;
  has_next: boolean;
  loading: boolean; // first page in flight with no rows yet
  is_refreshing: boolean; // page-1 reload while rows already present
  loading_more: boolean;
  error: string | null;
  filters: TransactionsFilters;
  set_filters: (patch: Partial<TransactionsFilters>) => void; // merges over current; all-null fields reset to "all"
  load_more: () => Promise<void>;
  /** Reload page 1 of the ACTIVE window. Pass the account id(s) a write just
   *  touched to also drop those cached windows (and the "all accounts"
   *  aggregate) while leaving unrelated accounts' loaded feeds intact. */
  refetch: (touched_account_ids?: string[] | null) => Promise<void>; // never rejects
};

// --- Loans feed (GET /loans) ---

export type LoanStatus = InfoLoanStatus | "CLOSED"; // /info only ever returns OPEN/PARTIALLY_REPAID

export type LoanRepayment = {
  id: string;
  amount: number; // wire number
  date_repaid: string; // ISO
  description: string | null;
  account: { id: string; name: string } | null;
};

export type LoanEntry = {
  id: string;
  direction: LoanDirection;
  status: LoanStatus;
  amount: number; // wire number
  description: string | null;
  counterparty_id: string;
  counterparty_name: string;
  date_issued: string; // ISO
  remaining: number; // wire number
  total_repaid: number; // wire number
  repayments: LoanRepayment[];
};

export type LoansPage = {
  loans: LoanEntry[];
  next_cursor: string | null;
  has_next: boolean;
};

export type LoansFilters = {
  status: LoanStatus | null;
  direction: LoanDirection | null;
  counterparty_id: string | null;
};

export type LoansListQuery = LoansFilters & {
  cursor?: string | null;
  limit: number;
};

export type LoansContextValue = {
  loans: LoanEntry[];
  next_cursor: string | null;
  has_next: boolean;
  loading: boolean; // first page in flight with no rows yet
  is_refreshing: boolean; // page-1 reload while rows already present
  loading_more: boolean;
  error: string | null;
  filters: LoansFilters;
  set_filters: (patch: Partial<LoansFilters>) => void; // merges over current; null resets a dimension
  load_more: () => Promise<void>;
  refetch: () => Promise<void>; // reload page 1 for current filters; never rejects
};

// --- Transaction forms ---

/** A charge is the fee paid to move money (bank/transfer/processing fee).
 *  It is always expressed in the account currency. For sources (money out) it is
 *  added to `amount`; for destinations (money in) it is deducted from `amount`. */
export type LogExpenseSource = { account_id: string; amount: number; charge: number };
export type LogExpensePayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  category_name: string | null;
  sources: LogExpenseSource[];
  bypass_warnings: string[];
};

export type LogIncomeDestination = {
  account_id: string;
  amount: number;
  charge: number;
};
export type LogIncomePayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  destinations: LogIncomeDestination[];
};

export type LogTransferPayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  from_account_id: string;
  to_account_id: string;
  amount: number;
  charge: number;
  bypass_warnings: string[];
};

export type LogGiveLoanSource = {
  account_id: string;
  amount: number;
  charge: number;
};
export type LogGiveLoanPayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  counterparty_name: string;
  sources: LogGiveLoanSource[];
  bypass_warnings: string[];
};

export type LogBorrowDestination = {
  account_id: string;
  amount: number;
  charge: number;
};
export type LogBorrowPayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  counterparty_name: string;
  destinations: LogBorrowDestination[];
};

export type LogRepayLoanSource = {
  account_id: string;
  amount: number;
  charge: number;
};
export type LogRepayLoanPayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  loan_id: string;
  sources: LogRepayLoanSource[];
  bypass_warnings: string[];
};

export type LogReceiveRepaymentDestination = {
  account_id: string;
  amount: number;
  charge: number;
};
export type LogReceiveRepaymentPayload = {
  description: string;
  transaction_date: string; // UTC ISO datetime ending in "Z"
  loan_id: string;
  destinations: LogReceiveRepaymentDestination[];
  bypass_warnings: string[];
};

export type PickerItem = { id: string; name: string; subtitle?: string };

export type PickerSheetProps = {
  open: boolean;
  title: string;
  items: PickerItem[];
  /** Tint for the selected state, radio dot and create action. Since the sheet
   *  portals to <body>, callers pass their form accent explicitly. */
  accent_color?: string;
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

/** A card row that opens a picker for a name (category, counterparty). */
export type NameFieldProps = {
  icon: LucideIcon;
  value: string | null;
  placeholder: string;
  error?: string;
  optional_label?: string;
  on_click: () => void;
};

/** A card row that opens the loan picker. Shows the counterparty plus the
 *  loan's outstanding balance once one is chosen. */
export type LoanFieldProps = {
  icon: LucideIcon;
  loan: InfoLoan | null;
  currency: string;
  placeholder: string;
  error?: string;
  on_click: () => void;
};

export type LoanPickerSheetProps = {
  open: boolean;
  title: string;
  loans: InfoLoan[];
  currency: string;
  accent_color: string;
  selected_id?: string | null;
  on_select: (loan_id: string) => void;
  on_close: () => void;
  empty_message?: string;
};

export type AllocationRowData = {
  key: string;
  account_id: string;
  amount: string;
  charge: string;
};

export type AllocationsListProps = {
  label?: string;
  helper_text?: string;
  add_label: string;
  total_label: string;
  rows: AllocationRowData[];
  accounts: InfoAccount[];
  currency: string;
  accent_color?: string;
  account_placeholder?: string;
  total: number;
  on_add: () => void;
  on_remove: (index: number) => void;
  on_account_click: (index: number) => void;
  on_amount_change: (index: number, value: string) => void;
  on_charge_change: (index: number, value: string) => void;
  charge_effect?: "add" | "subtract";
  combined_label?: string;
  root_error?: string;
  row_error?: (
    index: number,
    key: "account_id" | "amount" | "charge",
  ) => string | undefined;
};

export type ExpenseFormProps = {
  on_success: () => void;
};

export type IncomeFormProps = {
  on_success: () => void;
};

export type TransferFormProps = {
  on_success: () => void;
};

export type GiveLoanFormProps = {
  on_success: () => void;
};

export type BorrowFormProps = {
  on_success: () => void;
};

export type RepayLoanFormProps = {
  on_success: () => void;
};

export type ReceiveRepaymentFormProps = {
  on_success: () => void;
};

export type ExpensePickerTarget =
  | { kind: "account"; row_index: number }
  | { kind: "category" };

// --- Home / dashboard ---

export type BalancesProps = {
  accounts: InfoAccount[];
  currency_symbol: string;
  net_total: number; // sum of account balances — shown on the "All Accounts" card
  /** Account the feed is filtered to; null means the "All Accounts" card. */
  active_account_id: string | null;
  loading: boolean; // first /info fetch still in flight with no data yet
  on_select_account: (account_id: string | null) => void;
};

export type TransactionRowProps = {
  entry: TransactionEntry;
  /** Show the owning account name when the feed spans all accounts. */
  show_account_name: boolean;
  currency_symbol: string;
  /** IANA tz from /info; "" falls back to device-local for date rendering. */
  time_zone?: string;
  on_click: (entry: TransactionEntry) => void;
};

export type TransactionDetailSheetProps = {
  entry: TransactionEntry | null;
  currency_symbol: string;
  time_zone: string; // IANA tz from /info; "" falls back to device-local
  on_close: () => void;
};

export type DateRangeSheetProps = {
  open: boolean;
  start_date: string | null; // YYYY-MM-DD
  end_date: string | null;
  /** Fires on every date change; pass null for an open-ended side. */
  on_change: (start_date: string | null, end_date: string | null) => void;
  on_close: () => void;
};

export type FilterChipsProps = {
  category_label: string; // selected category name or "Category"
  has_category: boolean;
  range_label: string; // "All time" or a formatted date range
  has_date_range: boolean;
  on_open_category: () => void;
  on_open_date_range: () => void;
  /** Clears the category + date-range filters (keeps the account scope). */
  on_clear: () => void;
};
