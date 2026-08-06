# Schema & Design Decisions — Personal Finance Log

This document captures the full database schema and the reasoning behind every
design decision made along the way. Companion to the earlier "Project Overview"
doc, which covers the accounting theory (double-entry, debit/credit, T-accounts,
budget carryover). This document is the concrete implementation layer built on
top of that theory.

---

## Tech stack decisions

- **Database:** PostgreSQL, self-hosted (deliberately, as a learning project —
  chosen over managed options like Supabase/Neon specifically to learn Postgres
  administration and backups).
- **ORM:** Prisma.
- **AI extraction layer:** Gemini API (`gemini-3.5-flash-lite`), built and tested
  separately, not yet wired into this schema. Deprioritized for now in favor of
  building out the core double-entry app first.

---

## Full Prisma schema (might be outdated jsyk)

```prisma
model Account {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  account_type String   // "asset" | "liability" | "equity" | "income" | "expense"
  category     String?  // nullable; only meaningful when account_type = "expense"
  is_active    Boolean  @default(true)

  journal_entries JournalEntry[]

  @@map("accounts")
}

model JournalEntry {
  id             Int      @id @default(autoincrement())
  entry_group_id String   @db.Uuid
  entry_date     DateTime @db.Date
  description    String
  account_id     Int
  account        Account  @relation(fields: [account_id], references: [id])
  debit          Decimal  @default(0) @db.Decimal(12, 2)
  credit         Decimal  @default(0) @db.Decimal(12, 2)
  created_at     DateTime @default(now())

  @@map("journal_entries")
}

model BudgetAllocation {
  id           Int      @id @default(autoincrement())
  entry_date   DateTime @db.Date
  category     String
  amount       Decimal  @db.Decimal(12, 2)
  description  String?
  period_label String   // e.g. "2026-08"

  @@map("budget_allocations")
}

model Counterparty {
  id    Int    @id @default(autoincrement())
  name  String @unique

  loans Loan[]

  @@map("counterparties")
}

model Loan {
  id              Int      @id @default(autoincrement())
  direction       String   // "given" | "borrowed"
  counterparty_id Int
  counterparty    Counterparty @relation(fields: [counterparty_id], references: [id])
  original_amount Decimal  @db.Decimal(12, 2)
  date_issued     DateTime @db.Date
  status          String   @default("open") // "open" | "partially_repaid" | "closed"
  entry_group_id  String   @db.Uuid

  repayments      LoanRepayment[]

  @@map("loans")
}

model LoanRepayment {
  id             Int      @id @default(autoincrement())
  loan_id        Int
  loan           Loan     @relation(fields: [loan_id], references: [id])
  amount         Decimal  @db.Decimal(12, 2)
  date_repaid    DateTime @db.Date
  entry_group_id String   @db.Uuid

  @@map("loan_repayments")
}
```

---

## Computed views (not physical tables)

Two derived views sit on top of the schema above. Prisma doesn't manage views
natively in `schema.prisma` — these are written as raw SQL in a migration, and
queried via `$queryRaw` or introspected as read-only models.

**`account_balances`** — the T-account equivalent, one row per account showing
running balance, sign-adjusted per account type.

```sql
CREATE VIEW account_balances AS
SELECT 
  a.name,
  a.account_type,
  SUM(j.debit) AS total_debit,
  SUM(j.credit) AS total_credit,
  CASE 
    WHEN a.account_type IN ('asset', 'expense') 
      THEN SUM(j.debit) - SUM(j.credit)
    ELSE SUM(j.credit) - SUM(j.debit)
  END AS balance
FROM journal_entries j
JOIN accounts a ON a.id = j.account_id
GROUP BY a.id, a.name, a.account_type;
```

**`budget_report`** — Total Allocated vs. Total Spent vs. Remaining, per
category per period.

```sql
CREATE VIEW budget_report AS
SELECT
  ba.category,
  ba.period_label,
  SUM(ba.amount) AS total_allocated,
  COALESCE(spent.total_spent, 0) AS total_spent,
  SUM(ba.amount) - COALESCE(spent.total_spent, 0) AS remaining
FROM budget_allocations ba
LEFT JOIN (
  SELECT a.category, TO_CHAR(j.entry_date, 'YYYY-MM') AS period_label, 
         SUM(j.debit) AS total_spent
  FROM journal_entries j
  JOIN accounts a ON a.id = j.account_id
  WHERE a.account_type = 'expense' AND a.category IS NOT NULL
  GROUP BY a.category, TO_CHAR(j.entry_date, 'YYYY-MM')
) spent ON spent.category = ba.category AND spent.period_label = ba.period_label
GROUP BY ba.category, ba.period_label, spent.total_spent;
```

**Efficiency note:** plain views re-run their underlying query on every read —
no caching. Fine indefinitely at personal-project scale. If the journal ever
grows into hundreds of thousands of rows, the first lever is adding indexes on
`account_id` and `entry_date`; only after that would a materialized view
(a periodically-refreshed cached snapshot) become worth considering.

---

## Key design decisions and the reasoning behind them

### Why three tables + Loan/LoanRepayment, not just one flat table

Initially considered a single flat table (`type`, `description`, `amount`).
Rejected because loans given/received would corrupt income/expense totals if
treated as income/expense types — lending money doesn't reduce your net worth,
it converts cash into a receivable. This is exactly the problem double-entry
bookkeeping exists to solve, so the schema follows real double-entry structure:
Journal (source of truth) + per-account views (derived) + a separate Loan
layer (for tracking *which specific loan* a repayment closes, which plain
account balances can't answer on their own).

### Why `journal_entries` uses a shared `entry_group_id` instead of one row with two account columns

Considered storing one row per transaction with both a `debit_account` and
`credit_account` column. Rejected in favor of two rows per transaction (one
per account side), linked by `entry_group_id`, because:
- It mirrors how real ledgers/T-accounts work (filtering "everything that
  touched Cash" is a single simple query).
- It naturally supports **compound entries** (more than one debit or credit
  line per real-world event — e.g., a loan repayment split across multiple
  loans, or a payment split between a loan repayment and a tip/gift).
- It powers the UI feature of clicking one row and highlighting its paired
  row(s), since they all just share the same `entry_group_id`.

### Why the Journal is append-only, with no edit or delete

Mistakes are corrected by inserting a new reversing entry, never by editing or
deleting historical rows. This preserves a full audit trail, matching real
accounting practice, and was made an explicit rule specifically because the
temptation to "just fix the row" was identified as the most likely way the
system's integrity would quietly erode over time.

### Why Accounts are disabled, not deleted

Deleting an `Account` row would break or orphan every historical
`JournalEntry` referencing it via foreign key. Instead, `Account.is_active`
lets old accounts be hidden from new-entry dropdowns while historical Journal
data referencing them stays fully intact and queryable.

### Why category lives on `Account` (nullable) rather than a separate budgeting account type

Budget categories (Transport, Groceries, etc.) are not new Asset-like
accounts — they're still fundamentally Expense. Modeling them as a `category`
tag on Expense-type Account rows keeps the double-entry mechanics completely
unchanged (Expense still just increases with Debit), while still enabling
budget reporting via a simple filter on that tag. This was a deliberate
rejection of an earlier idea to model budget envelopes as real sub-accounts,
because real-world spending is split messily across Cash/Bank/withdrawals, and
forcing it through dedicated envelope accounts would fight that reality
instead of working with it.

### Why `budget_allocations` is a separate append-only log, not a single mutable "limit" field

An earlier design used a static `monthly_limit` per category. Rejected because
real budgeting needs top-ups mid-period and carryover from the previous
period. The final design treats allocations like a mini-ledger of their own:
every top-up is a new row, and each new period opens with an explicit
"Balance b/d" row (equal to the prior period's Remaining) rather than
automatically summing all-time — mirroring the same brought-down/carried-down
(b/d, c/f) convention used in traditional ledger period-closing. This was
chosen deliberately over an all-time running-sum alternative, specifically
because the b/d approach gives clearer month-by-month visibility into
spending patterns, which was the actual goal.

### Why Budget Remaining is allowed to go negative, but real ledger accounts are not

Receivables, Loans Payable, Income, and Expense should never go negative in
this simplified system — a negative value there indicates a data entry error.
Cash's negative-allowed status is a deliberate open design choice (whether to
model overdraft). Equity is the one ledger account that can legitimately be
negative (liabilities exceeding assets is a real financial state, not an
error).

Budget Remaining is different: it's explicitly *not* physically enforced money
(no real envelope accounts exist), so overspending a category is entirely
possible and Remaining going negative is a meaningful, correct signal ("you
overspent Transport this month"), not an error condition. The system is
designed to make overspending *visible*, not to physically prevent it — this
distinction was deliberated at length and settled on deliberately, since
enforcing it physically was considered and rejected as unrealistic
(splitting money across real bank/cash sub-accounts was found to be messy in
past personal experience).

### Why Loan and LoanRepayment exist alongside the Journal, not instead of it

Every loan-given, loan-received, and repayment event still produces the
standard Journal entry pair(s) — that's what keeps overall account balances
(Receivables, Loans Payable, Cash, Bank) correct. `Loan` and `LoanRepayment`
answer a different, more granular question the Journal alone cannot: "which
specific loan does this repayment close, and how much of it remains
outstanding." Each `Loan` and `LoanRepayment` row carries the `entry_group_id`
of its corresponding Journal entry, linking the two layers together without
duplicating the accounting logic.

### Why repayments can split across multiple loans via compound entries, rather than a nested repayment-allocation UI

Real repayments don't always cleanly match one open loan (e.g., partial
payments, borrowing again while still owing, one payment closing an old loan
and starting to pay down a newer one). Rather than building a separate
nested-allocation interface, the design reuses the existing "rows of
account + amount" entry pattern: a single real payment becomes one Debit
(e.g., Bank) and multiple Credit rows (each tied to a different `Loan` via the
UI's repayment-picker), all sharing one `entry_group_id`. This is a standard
accounting concept called a **compound entry** — more than two lines in a
single transaction, as long as total debits still equal total credits. The
same mechanism also generalizes to non-loan cases, e.g., one payment covering
two different expense categories at once.

### Why overpayments (e.g., a repayment plus an unrequested "keep the change" tip) are handled as an extra compound-entry line, not a special case

If a repayment exceeds what's owed, the excess isn't forced into the Loan
system — it's recorded as its own line in the same compound entry (e.g.,
Credit Income for the excess amount), keeping `LoanRepayment` totals accurate
to only the real loan being closed, while still correctly capturing the extra
money as legitimate income elsewhere in the Journal.

### Why the "new loan / repayment / correction" choice is context-aware based on debit vs. credit side, not a flat three-way choice

Receivables is an Asset (Debit = increase, Credit = decrease). A brand-new
loan can only ever appear as a Receivables *increase* (a Debit-side entry) —
it's structurally impossible for a new loan to be represented by a Receivables
decrease. So when a user selects Receivables on a Debit row, the UI should
only offer "New loan" (or "Correction," for fixing a previously
under-recorded loan); when selected on a Credit row, only "Repayment" or
"Correction" should be offered. This was corrected from an earlier version
that considered a flat three-way choice regardless of debit/credit side,
which would have allowed logically impossible combinations (e.g., "new loan"
on a decreasing Receivables entry).

### Why Counterparty is a lightweight reference table, not a ledger Account

People are not Asset/Liability/Income/Expense categories, so counterparties
were deliberately kept entirely outside the double-entry `Account` model —
`Counterparty` never appears in `journal_entries` and has no debit/credit
behavior. It exists purely to prevent typo-driven data fragmentation (e.g.,
"Tunde" vs. "tunde" vs. "Tunde " being treated as different people) and to
enable clean grouping/aggregation queries (e.g., "total owed by Tunde across
all loans"). This was deliberated over concern that it "feels like keeping a
list of debtors" — resolved by reframing it as a plain name registry
(structurally the same as a contacts list), with the actual debt-tracking
logic living entirely in `Loan` and `LoanRepayment`, not in `Counterparty`
itself. A looser alternative (plain string field + UI autocomplete, no
dedicated table/foreign key) was considered and left as a valid fallback if
the dedicated table ever feels like unwanted overhead.

---

## Open items / not yet decided

- Whether Cash should be allowed to go negative (modeling overdraft) or
  treated as a hard floor at zero like Receivables/Loans Payable/Income/
  Expense.
- Whether loan interest is ever a real feature (currently assumed loans are
  repaid at face value, no interest, and repayments summing higher than
  `original_amount` are only ever explained by tips/overpayment handled via
  compound-entry Income lines, not by an interest mechanism).
- The AI extraction layer (Gemini-based natural language → structured
  transaction) exists and was tested independently, but is not yet wired into
  this schema. The four (soon six) extraction types (`expense`, `income`,
  `money_lent`, `money_lent_returned`, planned `money_borrowed` /
  `money_borrowed_returned`) map conceptually onto Journal entries against
  the relevant Accounts, but the actual integration code has not been
  written.
- Migration file structure for the two SQL views has not yet been written
  (schema.prisma covers only the physical tables).