// test-suite.ts
// Run with: npx tsx test-suite.ts   (or ts-node, or node --experimental-strip-types on 22+)

// ─────────────────────────────────────────────────────────────
// CONFIG — fill these in
// ─────────────────────────────────────────────────────────────
const HOST = process.env.HOST ?? "127.0.0.1";
const CONFIG = {
  BASE_URL: `http://${HOST}:8080`, // <-- your server
  ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIwZGViM2QwLTljMGUtNDYxOS1hZGFlLWNhMzM5OGI3MzcwMyIsImlhdCI6MTc4ODc4NTAzOSwiZXhwIjoxNzg4OTU3ODM5fQ.-oM8AD2RqlZTq9TqW2ZvgvHcEBxG3lElIELNG4xd4Rk",                  // <-- paste bearer token
  ACCOUNTS: {
    CASH: "c2bb0838-c596-40b7-9393-9c3c9d48c7b3",    // <-- Cash account id
    BANK: "5593507b-36ae-4544-984c-9b6172c4ffda",    // <-- Bank account id
    SAVINGS: "f7c925a8-1abc-4118-8423-195a415122ad", // <-- Savings account id
  },
};

type AccountKey = keyof typeof CONFIG.ACCOUNTS;
const ACCOUNT_KEYS: AccountKey[] = ["CASH", "BANK", "SAVINGS"];

for (const [k, v] of Object.entries(CONFIG.ACCOUNTS)) {
  if (!v) throw new Error(`Missing account id for ${k} — fill in CONFIG.ACCOUNTS`);
}
if (!CONFIG.ACCESS_TOKEN) throw new Error("Missing CONFIG.ACCESS_TOKEN");

// ─────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────
async function apiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${CONFIG.BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function getInfo() {
  const { status, json } = await apiRequest("GET", "/info");
  if (status !== 200) throw new Error(`GET /info failed: ${status} ${JSON.stringify(json)}`);
  return json as {
    currency_symbol: string;
    iana_timezone: string;
    accounts: { id: string; name: string; balance: number }[];
    categories: { id: string; name: string }[];
    counterparties: { id: string; name: string }[];
    open_loans: {
      id: string;
      amount: number;
      status: "OPEN" | "PARTIALLY_REPAID" | "CLOSED";
      direction: "GIVEN" | "BORROWED";
      date_issued: string;
      counterparty_id: string;
      counterparty_name: string;
      total_repaid: number;
    }[];
  };
}

async function findOpenLoanId(counterparty_name: string, direction: "GIVEN" | "BORROWED", amount: number) {
  const info = await getInfo();
  const loan = info.open_loans.find(
    (l) => l.counterparty_name === counterparty_name && l.direction === direction && closeEnough(l.amount, amount)
  );
  if (!loan) throw new Error(`Could not find open loan for ${counterparty_name} (${direction}, ${amount})`);
  return loan.id;
}

// ─────────────────────────────────────────────────────────────
// Number helpers
// ─────────────────────────────────────────────────────────────
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function closeEnough(a: number, b: number) {
  return Math.abs(round2(a) - round2(b)) < 0.005;
}

// ─────────────────────────────────────────────────────────────
// Running expected balances
// ─────────────────────────────────────────────────────────────
const expected: Record<AccountKey, number> = { CASH: 0, BANK: 0, SAVINGS: 0 };

// ─────────────────────────────────────────────────────────────
// Step definitions
// ─────────────────────────────────────────────────────────────
interface Step {
  label: string;
  build: () => Promise<{ method: string; path: string; body: any }>;
  expect: { status: number; warningCode?: string };
  deltas?: Partial<Record<AccountKey, number>>; // only applied when the request should succeed
  afterInfoCheck?: (info: Awaited<ReturnType<typeof getInfo>>) => void;
}

const A = CONFIG.ACCOUNTS;
const dt = (d: string) => `2026-08-${d}T09:00:00Z`;

const steps: Step[] = [
  // ── S1: income, no charge ──
  {
    label: "Aug 1 · Tunde's salary, 100,000 into Bank",
    build: async () => ({
      method: "POST",
      path: "/log/income",
      body: {
        description: "August salary",
        transaction_date: dt("01"),
        destinations: [{ account_id: A.BANK, amount: 100000, charge: 0 }],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: 100000 },
  },

  // ── S2: expense, single account, charge, new category ──
  {
    label: "Aug 1 · Monthly subscription 15,000 (charge 10) from Bank, new category",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Monthly subscriptions",
        transaction_date: dt("01"),
        category_name: "Subscriptions",
        sources: [{ account_id: A.BANK, amount: 15000, charge: 10 }],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: -15010 },
  },

  // ── S3: transfer, no charge ──
  {
    label: "Aug 2 · Transfer 20,000 Bank → Savings, no charge",
    build: async () => ({
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "Moving to savings",
        transaction_date: dt("02"),
        amount: 20000,
        charge: 0,
        from_account_id: A.BANK,
        to_account_id: A.SAVINGS,
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: -20000, SAVINGS: 20000 },
  },

  // ── S4: transfer, with charge (ATM-style withdrawal fee) ──
  {
    label: "Aug 3 · Transfer 5,000 Bank → Cash, charge 25.50",
    build: async () => ({
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "ATM withdrawal",
        transaction_date: dt("03"),
        amount: 5000,
        charge: 25.5,
        from_account_id: A.BANK,
        to_account_id: A.CASH,
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: -5025.5, CASH: 5000 },
  },

  // ── S5: expense, single account, existing-feel category, no charge ──
  {
    label: "Aug 4 · Groceries 3,500 from Cash, no charge",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Weekly groceries",
        transaction_date: dt("04"),
        category_name: "Groceries",
        sources: [{ account_id: A.CASH, amount: 3500, charge: 0 }],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: -3500 },
  },

  // ── S6: income into Cash (top-up so multi-account loan later doesn't run dry) ──
  {
    label: "Aug 4 · Side gig payment 2,500 into Cash",
    build: async () => ({
      method: "POST",
      path: "/log/income",
      body: {
        description: "Side gig payment",
        transaction_date: dt("04"),
        destinations: [{ account_id: A.CASH, amount: 2500, charge: 0 }],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: 2500 },
  },

  // ── S7: expense, no category ──
  {
    label: "Aug 6 · Transport 1,000 from Cash, no category",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Transport",
        transaction_date: dt("06"),
        category_name: null,
        sources: [{ account_id: A.CASH, amount: 1000, charge: 0 }],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: -1000 },
  },

  // ── S8: expense, multi-account split, charge on one line only ──
  {
    label: "Aug 5 · Rent 45,000 split Bank 30,000 (charge 15) + Savings 15,000 (no charge)",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Monthly rent",
        transaction_date: dt("05"),
        category_name: "Rent",
        sources: [
          { account_id: A.BANK, amount: 30000, charge: 15 },
          { account_id: A.SAVINGS, amount: 15000, charge: 0 },
        ],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: -30015, SAVINGS: -15000 },
  },

  // ── S9: give_loan, single account, no charge, new counterparty ──
  {
    label: "Aug 7 · Lend Ade 10,000 from Bank, no charge",
    build: async () => ({
      method: "POST",
      path: "/log/loan",
      body: {
        description: "Lent to Ade",
        transaction_date: dt("07"),
        counterparty_name: "Ade",
        sources: [{ account_id: A.BANK, amount: 10000, charge: 0 }],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: -10000 },
  },

  // ── S10: give_loan, multi-account split, charges on both lines, new counterparty ──
  {
    label: "Aug 8 · Lend Chioma 5,000 split Cash 2,000 (charge 0.50) + Savings 3,000 (charge 0.50)",
    build: async () => ({
      method: "POST",
      path: "/log/loan",
      body: {
        description: "Lent to Chioma",
        transaction_date: dt("08"),
        counterparty_name: "Chioma",
        sources: [
          { account_id: A.CASH, amount: 2000, charge: 0.5 },
          { account_id: A.SAVINGS, amount: 3000, charge: 0.5 },
        ],
        bypass_warnings: [],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: -2000.5, SAVINGS: -3000.5 },
  },

  // ── S11: borrow, no charge, new counterparty ──
  {
    label: "Aug 9 · Borrow 20,000 from Emeka into Bank, no charge",
    build: async () => ({
      method: "POST",
      path: "/log/borrow",
      body: {
        description: "Borrowed from Emeka",
        transaction_date: dt("09"),
        counterparty_name: "Emeka",
        destinations: [{ account_id: A.BANK, amount: 20000, charge: 0 }],
      },
    }),
    expect: { status: 200 },
    deltas: { BANK: 20000 },
  },

  // ── S12: borrow, with charge, existing counterparty (Ade, reused across directions) ──
  {
    label: "Aug 10 · Borrow 8,000 from Ade into Savings, charge 12.50",
    build: async () => ({
      method: "POST",
      path: "/log/borrow",
      body: {
        description: "Borrowed from Ade",
        transaction_date: dt("10"),
        counterparty_name: "Ade",
        destinations: [{ account_id: A.SAVINGS, amount: 8000, charge: 12.5 }],
      },
    }),
    expect: { status: 200 },
    deltas: { SAVINGS: 7987.5 },
  },

  // ── S13: repay_loan, partial, no charge ──
  {
    label: "Aug 11 · Repay 10,000 toward Emeka loan (partial), no charge",
    build: async () => {
      const loan_id = await findOpenLoanId("Emeka", "BORROWED", 20000);
      return {
        method: "POST",
        path: "/log/loan-repayed",
        body: {
          description: "Partial repayment to Emeka",
          transaction_date: dt("11"),
          loan_id,
          sources: [{ account_id: A.BANK, amount: 10000, charge: 0 }],
          bypass_warnings: [],
        },
      };
    },
    expect: { status: 200 },
    deltas: { BANK: -10000 },
    afterInfoCheck: (info) => {
      const loan = info.open_loans.find((l) => l.counterparty_name === "Emeka" && l.direction === "BORROWED");
      if (!loan || loan.status !== "PARTIALLY_REPAID" || !closeEnough(loan.total_repaid, 10000))
        throw new Error(`Emeka loan expected PARTIALLY_REPAID/total_repaid=10000, got ${JSON.stringify(loan)}`);
    },
  },

  // ── S14: repay_loan, final payment, with charge → loan closes ──
  {
    label: "Aug 12 · Repay remaining 10,000 to Emeka (closes loan), charge 5",
    build: async () => {
      const loan_id = await findOpenLoanId("Emeka", "BORROWED", 20000);
      return {
        method: "POST",
        path: "/log/loan-repayed",
        body: {
          description: "Final repayment to Emeka",
          transaction_date: dt("12"),
          loan_id,
          sources: [{ account_id: A.BANK, amount: 10000, charge: 5 }],
          bypass_warnings: [],
        },
      };
    },
    expect: { status: 200 },
    deltas: { BANK: -10005 },
    afterInfoCheck: (info) => {
      const stillOpen = info.open_loans.find((l) => l.counterparty_name === "Emeka" && l.direction === "BORROWED");
      if (stillOpen) throw new Error(`Emeka loan should be CLOSED (absent from open_loans), still present: ${JSON.stringify(stillOpen)}`);
    },
  },

  // ── S15: receive_repayment, partial, no charge ──
  {
    label: "Aug 13 · Ade repays 4,000 toward the 10,000 loan (partial), into Cash",
    build: async () => {
      const loan_id = await findOpenLoanId("Ade", "GIVEN", 10000);
      return {
        method: "POST",
        path: "/log/borrow-returned",
        body: {
          description: "Ade partial repayment",
          transaction_date: dt("13"),
          loan_id,
          destinations: [{ account_id: A.CASH, amount: 4000, charge: 0 }],
          bypass_warnings: [],
        },
      };
    },
    expect: { status: 200 },
    deltas: { CASH: 4000 },
    afterInfoCheck: (info) => {
      const loan = info.open_loans.find((l) => l.counterparty_name === "Ade" && l.direction === "GIVEN");
      if (!loan || loan.status !== "PARTIALLY_REPAID" || !closeEnough(loan.total_repaid, 4000))
        throw new Error(`Ade GIVEN loan expected PARTIALLY_REPAID/total_repaid=4000, got ${JSON.stringify(loan)}`);
    },
  },

  // ── S16: receive_repayment, final, with charge → loan closes ──
  {
    label: "Aug 14 · Ade repays remaining 6,000 (closes loan), into Bank, charge 8.50",
    build: async () => {
      const loan_id = await findOpenLoanId("Ade", "GIVEN", 10000);
      return {
        method: "POST",
        path: "/log/borrow-returned",
        body: {
          description: "Ade final repayment",
          transaction_date: dt("14"),
          loan_id,
          destinations: [{ account_id: A.BANK, amount: 6000, charge: 8.5 }],
          bypass_warnings: [],
        },
      };
    },
    expect: { status: 200 },
    deltas: { BANK: 5991.5 },
    afterInfoCheck: (info) => {
      const stillOpen = info.open_loans.find((l) => l.counterparty_name === "Ade" && l.direction === "GIVEN");
      if (stillOpen) throw new Error(`Ade GIVEN loan should be CLOSED, still present: ${JSON.stringify(stillOpen)}`);
    },
  },

  // ── S17: INSUFFICIENT_BALANCE warning, no bypass ──
  {
    label: "Aug 15 · Attempt 50,000 expense from Cash (insufficient), no bypass → expect warning",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Big purchase",
        transaction_date: dt("15"),
        category_name: "Groceries",
        sources: [{ account_id: A.CASH, amount: 50000, charge: 0 }],
        bypass_warnings: [],
      },
    }),
    expect: { status: 409, warningCode: "INSUFFICIENT_BALANCE" },
    // no deltas — should not go through
  },

  // ── S18: same request, bypassed → succeeds, account goes negative ──
  {
    label: "Aug 15 · Same 50,000 expense, bypassed → succeeds (Cash goes negative)",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Big purchase (bypassed)",
        transaction_date: dt("15"),
        category_name: "Groceries",
        sources: [{ account_id: A.CASH, amount: 50000, charge: 0 }],
        bypass_warnings: ["INSUFFICIENT_BALANCE"],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: -50000 },
  },

  // ── S19: restore Cash via income (also a nice round-trip sanity check) ──
  {
    label: "Aug 15 · Top up Cash with 50,000 (round-trip check back to pre-bypass balance)",
    build: async () => ({
      method: "POST",
      path: "/log/income",
      body: {
        description: "Emergency top-up",
        transaction_date: dt("15"),
        destinations: [{ account_id: A.CASH, amount: 50000, charge: 0 }],
      },
    }),
    expect: { status: 200 },
    deltas: { CASH: 50000 },
  },

  // ── S20: REPAYMENT_DATED_BEFORE warning, no bypass ──
  {
    label: "Aug 16 · Repay Ade-borrowed loan dated before it was issued → expect warning",
    build: async () => {
      const loan_id = await findOpenLoanId("Ade", "BORROWED", 8000);
      return {
        method: "POST",
        path: "/log/loan-repayed",
        body: {
          description: "Early repayment attempt",
          transaction_date: dt("01"), // before Aug 10 issue date
          loan_id,
          sources: [{ account_id: A.SAVINGS, amount: 100, charge: 0 }],
          bypass_warnings: [],
        },
      };
    },
    expect: { status: 409, warningCode: "REPAYMENT_DATED_BEFORE" },
  },

  // ── S21: same request, bypassed → succeeds ──
  {
    label: "Aug 16 · Same repayment, dated-before bypassed → succeeds",
    build: async () => {
      const loan_id = await findOpenLoanId("Ade", "BORROWED", 8000);
      return {
        method: "POST",
        path: "/log/loan-repayed",
        body: {
          description: "Early repayment (bypassed)",
          transaction_date: dt("01"),
          loan_id,
          sources: [{ account_id: A.SAVINGS, amount: 100, charge: 0 }],
          bypass_warnings: ["REPAYMENT_DATED_BEFORE"],
        },
      };
    },
    expect: { status: 200 },
    deltas: { SAVINGS: -100 },
    afterInfoCheck: (info) => {
      const loan = info.open_loans.find((l) => l.counterparty_name === "Ade" && l.direction === "BORROWED");
      if (!loan || loan.status !== "PARTIALLY_REPAID" || !closeEnough(loan.total_repaid, 100))
        throw new Error(`Ade BORROWED loan expected PARTIALLY_REPAID/total_repaid=100, got ${JSON.stringify(loan)}`);
    },
  },

  // ── S22: validation error — duplicate account_id in sources ──
  {
    label: "Validation · duplicate account_id in expense sources → expect 400",
    build: async () => ({
      method: "POST",
      path: "/log/expense",
      body: {
        description: "Duplicate account test",
        transaction_date: dt("17"),
        category_name: "Groceries",
        sources: [
          { account_id: A.CASH, amount: 100, charge: 0 },
          { account_id: A.CASH, amount: 50, charge: 0 },
        ],
        bypass_warnings: [],
      },
    }),
    expect: { status: 400 },
  },

  // ── S23: validation error — transfer to same account ──
  {
    label: "Validation · transfer from_account_id === to_account_id → expect 400",
    build: async () => ({
      method: "POST",
      path: "/log/transfer",
      body: {
        description: "Same account transfer",
        transaction_date: dt("17"),
        amount: 100,
        charge: 0,
        from_account_id: A.CASH,
        to_account_id: A.CASH,
        bypass_warnings: [],
      },
    }),
    expect: { status: 400 },
  },

  // ── S24: validation error — non-positive amount ──
  {
    label: "Validation · income amount of 0 → expect 400",
    build: async () => ({
      method: "POST",
      path: "/log/income",
      body: {
        description: "Zero income",
        transaction_date: dt("17"),
        destinations: [{ account_id: A.CASH, amount: 0, charge: 0 }],
      },
    }),
    expect: { status: 400 },
  },
];

// ─────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────
async function run() {
  let passed = 0;
  let failed = 0;

  for (const step of steps) {
    const { method, path, body } = await step.build();
    const { status, json } = await apiRequest(method, path, body);

    const statusOk = status === step.expect.status;
    const warningOk = !step.expect.warningCode || (json as any)?.code === step.expect.warningCode;

    if (!statusOk || !warningOk) {
      failed++;
      console.log(`❌ ${step.label}`);
      console.log(
        `   expected status ${step.expect.status}${step.expect.warningCode ? ` (code: ${step.expect.warningCode})` : ""}, got ${status} ${JSON.stringify(json)}`
      );
      continue;
    }

    if (status !== 200) {
      passed++;
      console.log(`✅ ${step.label} (correctly rejected)`);
      continue;
    }

    if (step.deltas) {
      for (const [key, delta] of Object.entries(step.deltas)) {
        expected[key as AccountKey] = round2(expected[key as AccountKey] + (delta as number));
      }
    }

    const info = await getInfo();
    let ok = true;

    for (const key of ACCOUNT_KEYS) {
      const actual = info.accounts.find((a) => a.id === A[key])?.balance;
      if (actual === undefined || !closeEnough(actual, expected[key])) {
        ok = false;
        console.log(`   balance mismatch on ${key}: expected ${expected[key]}, got ${actual}`);
      }
    }

    if (step.afterInfoCheck) {
      try {
        step.afterInfoCheck(info);
      } catch (e) {
        ok = false;
        console.log(`   ${(e as Error).message}`);
      }
    }

    if (ok) {
      passed++;
      console.log(`✅ ${step.label}`);
    } else {
      failed++;
      console.log(`❌ ${step.label}`);
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);

  const finalInfo = await getInfo();
  console.log("\nFinal balances:", finalInfo.accounts);
  console.log("Final open loans:", finalInfo.open_loans);
  console.log(
    "Categories:",
    finalInfo.categories.map((c) => c.name)
  );
  console.log(
    "Counterparties:",
    finalInfo.counterparties.map((c) => c.name)
  );
}

run().catch((e) => {
  console.error("Suite crashed:", e);
  process.exit(1);
});