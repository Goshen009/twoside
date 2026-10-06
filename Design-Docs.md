# Design doc: Expense Notes (v1)

## Goal
Let a user record spending in plain text, then see what they spent and what it went to.

## Terms
- **Description:** the free text ("bolt to work")
- **Tag:** an optional label per transaction, one tag max (I'd avoid "category" since it sounds heavier than it is)
- **Day:** the local date the spend happened, in the user's timezone

## Ledger model
Double entry, two accounts: **Expenses** and **Wallet**. Each transaction debits Expenses and credits Wallet. Tag is a field on the transaction, not a separate account. No balances are shown. Income, transfers, and loans are out of scope.

## Actions the app must support

1. **Record a spend.** Type a note, such as "bolt 1.5k" or "data 2k yesterday". Fields: description, amount, day (default today, backdating via a date picker or "yesterday"), and optional tag. A send always saves, even if the tag or day is unresolved.
2. **See today's spend.** A banner at the top shows the total spent today and the entry count. ✅
3. **Browse transactions.** A list grouped by day with a daily total, filterable by tag and by date range, with a total shown for whatever is filtered. ✅
4. **See spend summaries.** For a chosen date range (week, month, or custom):
   - total per day
   - total per tag
   - total per tag per day (a grid) ✅
5. **Tag a transaction.** Pick from existing tags or create one. The app remembers the word-to-tag link, so the next "bolt" is tagged automatically (user can override). ✅
6. **Fix mistakes.** Edit or delete any transaction. ✅
7. **Manage tags.** Rename, merge, and delete. ✅
8. **Set a daily limit (optional).** One **global** daily limit, stored locally. Today's total turns red when it's exceeded. There is no per-tag limit.

## Important
- I am not adding in a date range for the time being. Instead, we'll give users the ability to collapse the days in the UI so that they can see at a glance how much was spent in each day without having to scroll to see each day.
- No date range or pagination in v1. All transactions load at once.
- Days are collapsible; each collapsed day shows its total and entry count.
- With a tag filter on, day totals and the headline total reflect that tag only.
- Revisit date range and pagination when any user passes a month of data or ~500 rows.

## Rules
- Parsing: the last number is the amount, `k` and `m` suffixes are allowed, `#` forces an amount, and the rest is the description.
- A day boundary is midnight in the user's timezone.
- Untagged spends appear as "Untagged" in summaries, not hidden.
- Totals always show their entry count, so a low number reads as "forgot to log."

## Out of scope for v1
Multiple accounts, income, loans, balances, per-tag budgets, bank alerts, AI parsing, sharing, business features.

## What we measure
- Does a user still log in week 2?
- When do they log? (record each note's creation time and look for clusters, since batches mean end-of-day logging)
- How often do they fix the tag or the day?

## Open questions
- Should multi-line paste (one spend per line) ship in v1? I'd say yes, because batching is likely.
- Should the tag be a field, or an expense sub-account? A field is simpler and keeps you in scope.

**What you were missing:** items 5, 6, and 7 (tagging flow, edit and delete, tag management). Without them the numbers can't be trusted, so they're not optional. Your "iii" and "v" also split cleanly: browsing is the list, and summaries are the aggregated views.








# Design doc: Expense Notes (v1, updated)

## Goal
Let a user record spending quickly, then see what they spent and what it went to.

## Terms
- **Description:** the free text ("bolt to work")
- **Tag:** an optional label, one per transaction, stored as a field
- **Day:** the local date of the spend, in the user's timezone

## Ledger model
Double entry with two accounts: **Expenses** and **Wallet**. Every transaction debits Expenses and credits Wallet. Tag is a field on the transaction, not an account. No balances shown. Income, transfers, loans, and multiple accounts are out of scope.

## Build order
Logging is independent of everything else, so don't let it block you.
1. Build the data layer and the one-screen UI against the **existing quick form** for logging.
2. Add the text input as a second way to create the same transaction.
3. Flip the default to text once it works.

## Actions the app must support

1. **Record a spend (form).** Description, amount, day (default today, date picker), optional tag.
2. **Record spends (text).** One or many lines in a single box. Each line becomes one transaction.
3. **See today's spend.** A banner shows total spent today and the entry count.
4. **Browse transactions.** List grouped by day, each day with its total. Filter by tag and by date range. A filtered view always shows its total.
5. **See summaries** for a date range (week, month, custom): total per day, total per tag, total per tag per day.
6. **Fix mistakes.** Edit or delete any transaction.
7. **Manage tags.** Rename, merge, delete.
8. **Daily limit (optional).** One **global** daily limit, saved locally. Today's total turns red when exceeded. No per-tag limits.

## Text input rules
- **Amount:** `#500` wins; otherwise the last number in the line. `k` and `m` suffixes are allowed (`1.5k`).
- **Tag:** `@transport`. Typing `@` opens an autocomplete of existing tags.
- **Description:** whatever is left.
- **Day:** one date chip for the whole batch, default today.
- **Enter key:** newline on mobile; send via the button. On desktop, Enter sends and Shift+Enter makes a newline.
- **Send always saves.** A line with no amount stays in the box, highlighted, while valid lines are saved.

## Live preview (always visible while typing)
- One line: two chips, **Amount** and **Tag**.
- Many lines: one compact row per line, plus a footer ("5 entries · ₦12,400").
- A tag close to an existing one shows "Transport?" rather than "new tag". A genuinely new tag shows a "new" marker. Tapping the tag chip opens a picker for people who skip `@`.

## Tagging
- Unknown tags are auto-created, guarded by the near-match check above.
- The app remembers word-to-tag links, so a later "bolt" gets its tag automatically, and the user can override.
- Untagged spends show as "Untagged" in summaries, not hidden.

## Rules
- A day ends at midnight in the user's timezone.
- Every total shows its entry count, so a low number reads as "forgot to log."
- Transactions store `source` (`text`, `text-batch`, or `form`) and a created-at time.

## Out of scope for v1
Multiple accounts, income, loans, balances, per-tag budgets, bank alerts, AI parsing, sharing, business features.

## What we measure
- Do users still log in week 2?
- When do they log? (Clusters of created-at times mean batching.)
- Which method do they use: text, batch text, or form? Text is the default and the form is one tap away, so the choice isn't just the default winning. Use the numbers to prompt follow-up questions, since the sample is tiny.
- How often is a tag or day corrected after sending?

## Open questions
- Should the daily limit stay in local storage, or move to the backend once people use more than one device?
- Is "tag" the right word for users? Test it in interviews.

Go build. The data layer and the one-screen UI don't depend on any of the text-parsing decisions, so you can start there and add the parser last.