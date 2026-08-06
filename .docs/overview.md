# Personal Finance Log — Project Overview & Accounting Model

## What this project is

A personal finance tracking app where transactions are logged via natural language
(e.g., typing "bought coffee for 150") which an AI model (Gemini) converts into
structured data. Instead of a plain spreadsheet with just income/expense rows, the
project has evolved into a **proper double-entry bookkeeping system**, because the
simple version couldn't correctly handle loans (money lent to friends / borrowed
from friends) without distorting real income/expense numbers.

The person building this is a developer, learning real accounting concepts
deliberately as part of the build — not just implementing accounting mechanically,
but trying to genuinely understand *why* it works this way. Explanations should
assume real understanding is the goal, not just correctness.

## The core problem that led here

Tracking "loan given" and "loan returned" as if they were expense/income types
seemed reasonable at first, but it's wrong: lending money doesn't make you poorer,
and getting it back doesn't make you richer — you've just converted cash into a
different form (a receivable) and back. Treating loans as expense/income would
corrupt the true profit/loss picture. This realization led to adopting real
double-entry bookkeeping, since it's specifically designed to solve this exact
problem.

## The accounting equation (the foundation of everything)

```
Assets = Liabilities + Equity
```

- **Assets** = things you own or are owed (Cash, Bank, Savings, Receivables)
- **Liabilities** = things you owe others (Loans Payable)
- **Equity** = your true net worth (Assets minus Liabilities)

Every transaction must keep this equation balanced. That's the entire point of
double-entry: every transaction touches **two accounts**, and the two sides always
net out so the equation never breaks.

## Debit and Credit — the convention (not intuition)

Debit and Credit are just two columns/sides. They don't inherently mean
"increase" or "decrease" — what they mean depends on which account they're
applied to. There are two groups:

| Group | Accounts | Debit means | Credit means |
|---|---|---|---|
| Group 1 | Assets, Expenses | Increase | Decrease |
| Group 2 | Liabilities, Income, Equity | Decrease | Increase |

Why the split: Assets sit alone on one side of the equation; Liabilities + Equity
sit together on the other side. Whichever convention is picked for Assets must be
mirrored for the other side to keep the equation balanced. Income and Expense are
temporary categories that feed into Equity (Income increases Equity, Expense
decreases it), so they inherit the behavior of whichever side they affect.

**Important trap to avoid:** everyday bank "debit alert / credit alert" language
is the *opposite* of this personal-ledger convention for Assets. Banks speak from
their own books, where your money is *their* liability, not your asset. Ignore
bank language entirely when reasoning about your own ledger — for Assets, Debit
always means "I now have more," Credit always means "I now have less," full stop.

## The three layers of this system

### 1. The Journal (source of truth, append-only)

A single chronological log. Every transaction produces **two rows**, one Debit
and one Credit, sharing a date/description, always summing to equal amounts.

Example — lending a friend 10,000:
```
Date   | Description   | Account       | Debit  | Credit
Aug 5  | Lent Tunde     | Receivables   | 10,000 |
Aug 5  | Lent Tunde     | Cash          |        | 10,000
```

This table is **never edited or deleted** — mistakes are fixed by adding a new
reversing entry, preserving a full audit trail. Total Debits across the whole
journal must always equal total Credits — this is the built-in error check
(a "trial balance").

### 2. T-Accounts / Ledger pages (per-account running view)

Each account (Cash, Bank, Savings, Receivables, Loans Payable, Income, Expense)
gets its own filtered view of the Journal — every row that touched it, split
into its Debit and Credit columns, with a running **Balance**.

```
Balance = (natural increasing side total) − (other side total)
```

For Assets/Expense, that's Debit total − Credit total. For
Liabilities/Income/Equity, it's Credit total − Debit total.

Zero-floor rule: in this simplified personal system, Receivables, Loans Payable,
Income, and Expense should never go negative — a negative value there signals a
data entry error. Cash *could* model an overdraft (negative allowed) depending on
design choice. Equity is the one account that legitimately CAN be negative
(it just means liabilities currently exceed assets).

### 3. Budget Allocations & Budget Report (a separate, virtual layer)

Budgeting is explicitly **not** modeled as real bank envelopes/sub-accounts,
because real-world spending is messy (split across Bank and Cash, cash
withdrawals mid-transaction, etc). Instead:

- Every Expense journal entry gets an additional **Category tag** (e.g.,
  "Transport", "Groceries") — purely a label, doesn't change the real
  Debit/Credit mechanics at all.
- A separate **Allocations log** (append-only, like the Journal) records how
  much virtual budget is assigned to each category, with dates and
  descriptions.
- A **Budget Report** (fully computed, never manually typed) shows, per
  category: Total Allocated, Total Spent (summed from tagged Journal entries),
  and Remaining.

This budget layer uses the same **balance brought down / carried down (b/d,
c/f)** mechanism as a period-based ledger: each new period (e.g., each month)
starts with a "Balance b/d" row equal to the prior period's Remaining, then new
allocations are logged for that period, and at period end the Remaining is
carried down into the next period's opening row. This mirrors real periodic
closing, applied one layer above the core ledger.

Crucially: unlike the real ledger accounts, **Remaining in the Budget Report is
allowed to go negative** — that's a meaningful signal (overspending a category),
not a data error. The budget is intentionally a soft, visible constraint, not a
hard enforcement mechanism — money isn't physically separated, so nothing stops
overspending except the visibility this report provides.

## Current state / open items

- Core double-entry mechanics (Journal, T-accounts, equation-balance check) are
  conceptually solid and tested by hand with worked examples.
- Budget Allocations design has been iterated through several models (static
  monthly limit → all-time running sum → final choice: **periodic b/d
  carryover**, matching real ledger conventions).
- Not yet finalized: wiring this full model (Journal, T-accounts, Budget
  Allocations/Report) into the actual app's database schema and UI. The
  original AI-extraction chatbot piece (Gemini-based, turning "bought coffee
  150" into structured JSON) was built and tested separately, and still needs
  to be connected to this now-more-sophisticated double-entry data model rather
  than a flat expense/income table.
- The AI extraction schema currently used four transaction types:
  `expense`, `income`, `money_lent`, `money_lent_returned` — with
  `money_borrowed` / `money_borrowed_returned` planned but not yet finalized,
  since the accounting-fundamentals detour took priority. These four (soon six)
  types map onto the double-entry model as: `expense` → Debit Expense account
  (Credit whichever real account paid), `income` → Credit Income (Debit
  whichever real account received), `money_lent` → Debit Receivables / Credit
  Cash-or-Bank, `money_lent_returned` → Debit Cash-or-Bank / Credit
  Receivables, and the borrowed pair will mirror this using Loans Payable
  instead of Receivables.