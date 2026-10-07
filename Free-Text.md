# Spec: Free-text logging (text → transactions)

Status: ready to implement. Standalone; contains all context needed.

## 1. Context

- **Product:** a minimal expense tracker for "customers" (not "users"; we intend to charge eventually). Beta of ~5 people. A customer logs spends, tags them, and sees where money went.
- **Why text logging exists:** the original idea was "type what you spent in plain text and have it recorded." Typing beats a form when recording in batches (end of day). The existing form stays as a second method so we can measure which one customers use.
- **Ledger:** double-entry, but only two accounts exist: **Expenses** and **Wallet**. Every transaction debits Expenses, credits Wallet. The server builds the entries; the client never sends them.
- **No AI.** Parsing is deterministic code. No model calls. No accounts, counterparties, loans, or income in text logging.

## 3. Scope

**In v1:** multi-line textarea; per-line parse of amount, tag, description; one batch date; live preview; partial-save; `@` autocomplete; form remains one tap away.

**Out of scope:** AI parsing, accounts, counterparties, income/loans, per-line arbitrary dates, bank alerts, voice, receipts, undo history.

**Phase 2 (not in v1):** keyword memory (see §10).

## 4. Input surface

- A multi-line `<textarea>` (auto-grows to ~6 lines, then scrolls) with a send button on the right. Text logging is the default surface; the form is one tap away.
- **Enter key (Decision):**
  - Touch devices (`(pointer: coarse)`): Enter inserts a newline. Only the send button sends.
  - Desktop: Enter sends; Shift+Enter inserts a newline.
- **Batch date chip** above the input: shows "Today"; tap opens a date picker; applies to **all lines** in the next send. **(Decision)** It persists while the composer is open and resets to Today when closed. This prevents accidental backdating the next day.
- **Send is never blocked.** It is enabled whenever the box contains at least one non-blank line.
- Pasting multi-line text works as-is: one transaction per non-blank line.

## 5. Parsing

Parsing is a pure function, no React and no network, so it can be unit-tested.

```ts
parseBatch(text: string, ctx: { tags: Tag[]; today: string /* YYYY-MM-DD in user tz */ }): ParsedLine[]
parseLine(line: string, index: number, ctx): ParsedLine
```

### 5.1 Pre-processing (per batch)
1. Normalize: replace non-breaking spaces and zero-width characters with normal spaces/nothing; convert smart quotes to plain quotes.
2. Split on `\n` (and `\r\n`). Trim each line.
3. **Skip blank lines**, but keep original line indexes for error labelling.
4. Limits: max **50 lines** per send, max **200 characters** per line. Extra lines/characters are flagged as errors, not silently dropped.

### 5.2 Order of extraction within a line
Tag first, amount second, description last. Extracted spans are masked so they never leak into later steps.

### 5.3 Tag extraction
- A tag token is `@` followed by `[A-Za-z0-9_-]+`, and the `@` must be at the start of the line or preceded by whitespace (so `a@b.com` is not a tag).
- **First tag token wins.** Additional `@` tokens produce a warning ("multiple tags, using the first") and stay in the description untouched.
- A lone `@` with nothing after it (autocomplete open) is ignored and stripped from the description.
- **Normalization for comparison:** lowercase, then remove spaces, hyphens, and underscores. So `@data-bundle`, `@DataBundle` and a tag named "Data Bundle" all match.
- **Resolution (in order):**
  1. **existing:** normalized exact match to one of the customer's tags → use it.
  2. **near:** not exact, but close to an existing tag (trigram similarity ≥ 0.8, **or** edit distance ≤ 1 when both names are ≥ 4 chars) → **(Decision)** auto-apply the existing tag, and show it in the preview marked as a guess (e.g. "Transport ~"). Rationale: typos are far more common than deliberately creating a name one letter away from an existing tag. If more than one existing tag is near, treat as `new` instead of guessing.
  3. **new:** otherwise a new tag will be created on send. Displayed name: the token as typed, first letter capitalized, hyphens/underscores turned into spaces.
  4. **none:** no tag token.
- Trigram similarity: lowercase, split on non-alphanumerics, pad each word with two leading spaces and one trailing space, take all 3-char slices, similarity = shared / union.
- Tag max length: 30 characters; longer is an error on that line.

### 5.4 Amount extraction
Scan the line (with the tag span masked) for numeric candidates using:

```
/(?<![A-Za-z0-9.])(#\s*)?(?:₦\s*)?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?([kKmM])?(?![A-Za-z0-9])/g
```

- Supports: `500`, `1,200`, `2.5k`, `1.5m`, `₦500`, `#500`.
- A number glued to letters is **not** a candidate (`mtn100`, `2pm`, `3rd`).
- `k` = ×1,000, `m` = ×1,000,000. Round to match the existing `Money.parse` behavior (use that, don't reinvent).
- **Priority ladder** (first non-empty level wins; within the level, the **last** candidate is picked):
  1. `#`-prefixed numbers (explicit override).
  2. Numbers with a `k`/`m` suffix.
  3. Plain numbers.
- **Ambiguity:** if the winning level has more than one candidate and there was no `#`, pick the last but set `ambiguous = true` and list all candidates. The preview shows a `?` marker. Ambiguity does **not** block saving (the preview is live, so the customer sees it before sending). **(Decision)**
- **Validity:** amount must be > 0 and ≤ 1,000,000,000. Zero/negative/oversized → line error.
- **No candidate** → line error "no amount".
- The `h` (hundred) suffix is intentionally **not** supported (collides with "2h" meaning hours).

### 5.5 Date words (stretch goal; skip if short on time)
Whole-word `today` / `yesterday`, only at the very start or very end of the line, overrides the batch date for that line and is removed from the description. Otherwise the batch date chip is the only date mechanism.

### 5.6 Description
1. Take the line, mask the tag span, amount span, and date word.
2. Replace `#` and stray `@` characters with spaces; collapse whitespace.
3. Strip filler words from the **edges only**: `for, on, at, of, to, the, a, an, with, and, via, using`. Never strip from the middle.
4. Keep the customer's casing and wording. Do not rewrite.
5. If the result is empty **(Decision):** use the tag's display name if there is one, else `"Expense"`.
6. Max 120 characters (truncate with a warning).

## 14. Open questions

- Should near-tag matches ask instead of auto-applying, if early customers get mis-tagged?
- Should ambiguous amounts block the send once real batches show wrong picks?
- Is `@` discoverable enough, or should the placeholder rotate examples (`bolt 1.5k @transport`)?
- Should `today`/`yesterday` inline words ship in v1 (§5.5), or is the date chip enough?
- Reuse from earlier prototype: the trigram `sim()` and amount scanner can be copied. The account, counterparty, and type logic from that prototype is **not** needed.