export interface LoanRepaymentItem {
  id: string;
  description: string;
  amount: number;
  date_repaid: string;
  bank_name: string;
}

export interface LoanItem {
  id: string;
  status: "OPEN" | "CLOSED";
  direction: "LENT" | "BORROWED"; // LENT = what I'm owed, BORROWED = what I owe
  counterparty_name: string;
  amount: number;
  total_repaid: number;
  date_issued: string;
  repayments: LoanRepaymentItem[];
}

export const DUMMY_LOANS: LoanItem[] = [
  // --- LENT (What I'm Owed) ---
  {
    id: "loan-1",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Chukwuemeka Obi",
    amount: 150000.00,
    total_repaid: 50000.00,
    date_issued: "2026-02-10",
    repayments: [
      { id: "rep-1", description: "First installment repayment", amount: 30000.00, date_repaid: "2026-02-20", bank_name: "Access Bank" },
      { id: "rep-2", description: "Part payment via transfer", amount: 20000.00, date_repaid: "2026-03-01", bank_name: "GTBank" }
    ]
  },
  {
    id: "loan-2",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Fatima Bello",
    amount: 75000.00,
    total_repaid: 25000.00,
    date_issued: "2026-02-15",
    repayments: [
      { id: "rep-3", description: "Partial return", amount: 25000.00, date_repaid: "2026-02-28", bank_name: "Zenith Bank" }
    ]
  },
  {
    id: "loan-3",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Tunde Ednut",
    amount: 200000.00,
    total_repaid: 0.00,
    date_issued: "2026-03-02",
    repayments: []
  },
  {
    id: "loan-4",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Amina Yusuf",
    amount: 50000.00,
    total_repaid: 50000.00,
    date_issued: "2026-01-10",
    repayments: [
      { id: "rep-4", description: "Full cash repayment cleared", amount: 50000.00, date_repaid: "2026-01-25", bank_name: "UBA" }
    ]
  },
  {
    id: "loan-5",
    status: "CLOSED",
    direction: "LENT",
    counterparty_name: "Oluwaseun Funmi",
    amount: 120000.00,
    total_repaid: 120000.00,
    date_issued: "2025-12-01",
    repayments: [
      { id: "rep-5", description: "Tranche 1", amount: 60000.00, date_repaid: "2025-12-15", bank_name: "GTBank" },
      { id: "rep-6", description: "Final settlement", amount: 60000.00, date_repaid: "2026-01-05", bank_name: "GTBank" }
    ]
  },
  {
    id: "loan-6",
    status: "CLOSED",
    direction: "LENT",
    counterparty_name: "Chinedu Okafor",
    amount: 90000.00,
    total_repaid: 90000.00,
    date_issued: "2025-11-20",
    repayments: [
      { id: "rep-7", description: "Complete settlement", amount: 90000.00, date_repaid: "2025-12-10", bank_name: "Access Bank" }
    ]
  },
  {
    id: "loan-7",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Grace Ekanem",
    amount: 60000.00,
    total_repaid: 10000.00,
    date_issued: "2026-02-25",
    repayments: [
      { id: "rep-8", description: "Token payback", amount: 10000.00, date_repaid: "2026-03-01", bank_name: "Fidelity Bank" }
    ]
  },
  {
    id: "loan-8",
    status: "OPEN",
    direction: "LENT",
    counterparty_name: "Ibrahim Sanni",
    amount: 300000.00,
    total_repaid: 100000.00,
    date_issued: "2026-02-01",
    repayments: [
      { id: "rep-9", description: "Monthly installment", amount: 100000.00, date_repaid: "2026-03-01", bank_name: "Stanbic IBTC" }
    ]
  },

  // --- BORROWED (What I Owe) ---
  {
    id: "loan-9",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Konga Credit Line",
    amount: 250000.00,
    total_repaid: 100000.00,
    date_issued: "2026-01-15",
    repayments: [
      { id: "rep-10", description: "First repayment deduction", amount: 100000.00, date_repaid: "2026-02-15", bank_name: "Zenith Bank" }
    ]
  },
  {
    id: "loan-10",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Micro-Lender Coop",
    amount: 100000.00,
    total_repaid: 20000.00,
    date_issued: "2026-02-05",
    repayments: [
      { id: "rep-11", description: "Partial remittance", amount: 20000.00, date_repaid: "2026-02-20", bank_name: "FCMB" }
    ]
  },
  {
    id: "loan-11",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Uncle John",
    amount: 500000.00,
    total_repaid: 150000.00,
    date_issued: "2025-12-20",
    repayments: [
      { id: "rep-12", description: "New Year offset", amount: 150000.00, date_repaid: "2026-01-02", bank_name: "GTBank" }
    ]
  },
  {
    id: "loan-12",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Blessing Okon",
    amount: 40000.00,
    total_repaid: 0.00,
    date_issued: "2026-03-01",
    repayments: []
  },
  {
    id: "loan-13",
    status: "CLOSED",
    direction: "BORROWED",
    counterparty_name: "QuickCash App",
    amount: 50000.00,
    total_repaid: 50000.00,
    date_issued: "2026-01-01",
    repayments: [
      { id: "rep-13", description: "Full liquidation", amount: 50000.00, date_repaid: "2026-01-14", bank_name: "Access Bank" }
    ]
  },
  {
    id: "loan-14",
    status: "CLOSED",
    direction: "BORROWED",
    counterparty_name: "Office Loan Scheme",
    amount: 180000.00,
    total_repaid: 180000.00,
    date_issued: "2025-10-01",
    repayments: [
      { id: "rep-14", description: "Salary deduction 1", amount: 90000.00, date_repaid: "2025-11-01", bank_name: "Stanbic IBTC" },
      { id: "rep-15", description: "Salary deduction 2", amount: 90000.00, date_repaid: "2025-12-01", bank_name: "Stanbic IBTC" }
    ]
  },
  {
    id: "loan-15",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Adeola S.",
    amount: 80000.00,
    total_repaid: 40000.00,
    date_issued: "2026-02-10",
    repayments: [
      { id: "rep-16", description: "Half refund", amount: 40000.00, date_repaid: "2026-02-25", bank_name: "UBA" }
    ]
  },
  {
    id: "loan-16",
    status: "OPEN",
    direction: "BORROWED",
    counterparty_name: "Emeka's Sister",
    amount: 150000.00,
    total_repaid: 50000.00,
    date_issued: "2026-01-28",
    repayments: [
      { id: "rep-17", description: "First return", amount: 50000.00, date_repaid: "2026-02-15", bank_name: "Access Bank" }
    ]
  }
];