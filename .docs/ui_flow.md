# UI & App Flow — Personal Finance Log (Continuation)

This continues the Schema & Design Decisions document, focusing on how the
app is actually imagined to work from the user's seat — the entry form, the
transaction flow, and especially the loan/repayment interaction, which is the
most intricate part of the whole app.

---

## Core entry form layout

It was decided that transaction entry would be built around **stacked
horizontal rows**, each representing one line of a journal entry (one
account touched, one amount, one debit/credit designation) — rather than a
form with fixed "from account" / "to account" fields.

Each row contains:
- A **dropdown** to select the Account (filtered to `is_active = true`)
- An **amount** field
- A **debit/credit toggle** (tick/radio)
- A **description** field (shared across the whole entry, not per-row, since
  one real event usually has one description)

It was decided to start with exactly **two rows by default** (the simplest,
most common case — one debit, one credit), with an **"add another line"**
button available to expand into a compound entry when needed (covered
below). This was chosen over forcing every entry through a compound-capable
UI from the start, since most day-to-day entries (a simple expense, a simple
income) only ever need two lines, and the extra rows would be visual clutter
for the common case.

It was decided that the form must **validate total debits equal total
credits** before allowing save — this is the same trial-balance check as the
whole ledger, just enforced at entry time instead of after the fact, catching
mistakes immediately rather than letting an unbalanced entry ever reach the
database.

---

## Context-aware behavior per account selection

It was decided that selecting certain accounts in a row triggers additional,
context-specific UI beneath that row, rather than treating every account
the same generic way. Specifically:

**Selecting an Expense-type account** → a secondary **category dropdown**
appears (Transport, Groceries, etc., or "None"), tagging the entry for the
Budget Report. It was decided this dropdown defaults to "None" rather than
being required, since not every expense needs to map to a tracked budget
category.

**Selecting Receivables** → it was decided the behavior differs by which
side (debit/credit) it was selected on, since a Receivables movement means
structurally different things depending on direction:
- **Debit side (Receivables increasing)** → offers "New loan" or
  "Correction." It was decided "New loan" is the default/expected choice
  here, since a brand-new loan is by far the more common real-world case
  than a correction.
- **Credit side (Receivables decreasing)** → offers "Repayment" or
  "Correction," with "New loan" deliberately excluded as an option here,
  since it was decided that would represent a logically impossible state
  (a new loan cannot be recorded as a decrease to what's owed to you).

**Selecting Loans Payable** → mirrors the Receivables logic exactly, just
for the borrowing direction (Credit = new borrowing, Debit = repaying what
you owe).

---

## The "New Loan" flow

It was decided that choosing "New loan" prompts two additional fields inline:
**Counterparty** (a searchable dropdown of existing names from the
`Counterparty` table, with an "add new" option typed directly into the same
field) and **date issued** (defaulting to the entry's date, editable if
needed).

On save, it was decided the app should, in one atomic action:
1. Insert the two (or more) `JournalEntry` rows as normal, sharing a new
   `entry_group_id`.
2. Insert a new `Loan` row, `status = "open"`, carrying that same
   `entry_group_id`, linking it directly to the Journal event that created
   it.

This was decided so that a user never has to separately "remember" to log a
loan after logging the transaction — one save action produces both the
accounting record and the trackable loan record together, keeping them
impossible to accidentally desync.

---

## The "Repayment" flow — the most intricate part

It was decided this needed the most careful design, since real repayments
don't cleanly map to one open loan every time (partial payments, multiple
concurrent loans to the same person, overpayment as a tip).

**Step 1 — Counterparty selection.** It was decided the user first picks
*who* is repaying (from the `Counterparty` dropdown), before seeing any
loans — rather than showing every open loan across every person at once,
which would be noisy and error-prone (risking tying a repayment to the wrong
person's loan by mistake).

**Step 2 — Open loans list.** Once a counterparty is picked, it was decided
the UI shows a list of that person's loans where `status != "closed"`,
ordered **oldest first** by `date_issued`. Each row shows the loan's original
amount and its current remaining balance (original amount minus sum of
existing repayments). It was decided oldest-first is the default ordering
because that matches the most common real-world assumption (repayments
naturally clear the longest-standing debt first) — though the user can
still tick loans out of order if that's not actually how the repayment
should be allocated.

**Step 3 — Allocation.** It was decided the user ticks one or more loans
from that list, and for each ticked loan, an amount field appears — **pre-
filled with whatever's left on that loan**, capped at whatever's left
unallocated from the total payment amount. The user can adjust these
manually (e.g., allocate less than the full remaining balance if only
partially closing a loan this time).

**Step 4 — Running "unallocated remaining" indicator.** It was decided the
UI shows a live running total: `total payment amount − sum of amounts
allocated so far`. This number drives what happens next:
- If it hits exactly **zero**, the entry is complete and ready to save.
- If it's still **positive** after all relevant loans are ticked (i.e., the
  payment is larger than everything currently owed), it was decided the
  leftover triggers a prompt: **"There's [X] left over — what should this be
  recorded as?"**, presenting a normal account dropdown (commonly Income,
  for a tip/gift, but left general-purpose). This becomes an additional
  Credit line in the same compound entry.

**On save**, it was decided the app should, atomically:
1. Insert all `JournalEntry` rows (one Debit for the account that received
   the money, e.g. Bank, and one Credit row per allocation — one per loan
   tied, plus one for any leftover) — all sharing one `entry_group_id`.
2. Insert one `LoanRepayment` row per ticked loan, each carrying that same
   shared `entry_group_id`, with its individually allocated amount.
3. Recalculate each affected `Loan.status` — `"closed"` if total repayments
   now equal or exceed `original_amount`, otherwise `"partially_repaid"`.

This was decided so that one real-world payment event, however it needs to
be split, always produces exactly one Journal transaction (matching the one
real bank transfer/cash handover that actually happened), while still
correctly updating potentially multiple `Loan` records behind the scenes.

**Why this was chosen over a separate, nested repayment-allocation screen:**
it was decided to reuse the same "rows of account + amount" pattern already
used for every other entry, rather than introduce an entirely different
interaction style just for loans. This keeps the mental model consistent
across the whole app — a compound entry is a compound entry, whether it's
splitting a grocery run across two expense categories or splitting a
repayment across two loans.

---

## The Journal / History view

It was decided this view shows the full chronological list of transactions,
grouped visually by `entry_group_id` (so each real-world event's lines sit
together, rather than a flat undifferentiated row-by-row list).

It was decided that **clicking any row highlights every other row sharing
its `entry_group_id`** — a single click reveals the "other side(s)" of that
transaction, including, for loan-related entries, a visual link through to
the specific `Loan` record(s) involved. This was chosen specifically to make
the double-entry relationship *visible* and intuitive at a glance, rather
than requiring the user to mentally trace matching amounts.

It was decided this view is strictly **read-only** — no edit or delete
controls exist here at all, consistent with the append-only design decision.
Corrections are made by starting a new entry (a reversing transaction), never
by modifying history.

---

## The Loans view

It was decided this is a dedicated screen, separate from the Journal,
listing all `Loan` records grouped by `counterparty`, split into two
sections by `direction` ("Given" — loans out, "Borrowed" — loans in). Each
loan shows original amount, amount repaid so far, remaining balance, and
status. It was decided this view is what answers "who owes me, how much,
and who do I owe" at a glance — pulling directly from `Loan` +
`LoanRepayment`, not requiring any Journal filtering by the user.

---

## The Budget view

It was decided this view lists each budget category with **Total
Allocated**, **Total Spent** (computed, filtered to the current
`period_label`), and **Remaining** — all read from the `budget_report`
computed view, never manually typed.

It was decided that starting a new period (e.g., a new month) requires an
explicit action: inserting a **"Balance b/d"** row into `budget_allocations`
for the new `period_label`, equal to the prior period's Remaining. This was
chosen as a deliberate manual step (rather than fully automatic rollover)
to mirror the traditional ledger period-closing convention, and because the
act of reviewing last month's Remaining before carrying it forward was
considered part of the value of the system — a moment of deliberate
reflection on spending patterns, not something to silently automate away.

It was decided that **Remaining going negative is allowed and expected**
here, displayed clearly (e.g., in a different color) as an overspend signal,
distinct from the Journal/ledger accounts, which enforce a zero-floor as a
data-integrity check rather than a real financial signal.

---

## The Dashboard (home screen)

It was decided the home screen surfaces, at a glance, without navigating
anywhere else:
- Current Cash and Bank balances (from `account_balances`)
- Total currently owed **to** the user, and total currently owed **by** the
  user (aggregated from open/partially-repaid `Loan` rows, split by
  `direction`)
- A per-counterparty breakdown of who owes what (not just a single combined
  number), since it was decided a single lumped total would hide useful
  detail (e.g., knowing specifically that Tunde owes 3,000 and Bola owes
  2,000, rather than just "5,000 owed to you" as an opaque figure)

This was deliberately scoped as a **read-only summary** — no entry actions
happen from the dashboard itself, keeping it a pure at-a-glance view, with
all actual transaction entry happening through the dedicated entry form
described above.

---

## Summary of the overall flow

1. User opens the entry form, picks accounts/amounts/debit-credit per row
   (starting at two rows, expandable).
2. Selecting Expense triggers an optional category tag. Selecting
   Receivables or Loans Payable triggers context-aware loan logic depending
   on debit/credit side.
3. "New loan" captures counterparty + date, and atomically creates both the
   Journal entry and a `Loan` record.
4. "Repayment" walks through counterparty → open loans → allocation → any
   leftover-as-extra-line, and atomically creates the Journal entry (possibly
   compound, multiple lines) plus one or more `LoanRepayment` records,
   updating affected `Loan.status` values.
5. Everything lands in the read-only Journal view, grouped and cross-
   highlightable by `entry_group_id`.
6. The Loans view, Budget view, and Dashboard are all pure derived reads off
   this same underlying data — nothing is entered directly into them.