# Add-Transaction flow: global action sheet + 7 forms + profile cache (UI)

## Context

The app currently has only auth + stubbed Home/Loans. This phase wires the navbar **+** (currently no-op) to a global two-step "New Transaction" flow reachable from **any authenticated screen**, and implements all 7 log forms (expense, income, transfer, give loan, borrow, repay loan, receive repayment) correctly against the backend log endpoints.

Two big complaints about the previous (legacy) implementation shape the design:
1. **Category/counterparty creation blocked on the network** — legacy pickers called `window.prompt` → `POST /categories|counterparties` → wait → refetch → select. New flow: the user just types a name; the form submits that **name string**; backend find-or-creates it in the same log request. No create-endpoint call anywhere in the forms.
2. **Frequent refetching of near-static data** — new data layer fetches categories, counterparties, accounts, and open loans **once per login** via a new aggregate endpoint, cached in a provider. Not refetched per keystroke or per picker open.

**Scope decision (user-confirmed): UI only.** The user implements the backend contract themselves (section below). Build compiles against the new contract; runtime depends on their backend landing. No files outside `twoside-ui/` change.

Route remount constraint that drives architecture: `App.tsx` runs `<AnimatePresence mode="wait"><Routes key={location.pathname}>`, so every routed subtree remounts on navigation. The flow's open state and rendered sheets, and the profile cache, must therefore live **above `AnimatedRoutes`**; only the trigger (`AppNavbar` +) sits inside routes and reaches them via context.

---

## Backend contract — user implements. Reminders (per user request):

**Category/counterparty become NAME strings (trimmed, case-insensitive compare):**
- `POST /log/expense`: field **`category: string | null`** (was `category_id` uuid). Optional.
- `POST /log/loan` (give loan) and `POST /log/borrow`: field **`counterparty: string`** (was `counterparty_id` uuid). Required.
- Find-or-create: existing **active** match → reuse; new → create in same request.
- ⚠️ **Trim the incoming string** so `"Transport"` and `"Transport "` are the same.
- ⚠️ **Compare case-insensitively** so `"Transport"` and `"transport"` are one category/counterparty.
- All other fields unchanged (below). Loan repay/return forms keep `loan_id` uuid. Income has no category/counterparty.

**New aggregate `GET /profile`** returns (full bundle):
```
accounts:      [{ id, name, type, is_active, balance }]        // pickable asset accounts, ₦ balance
categories:    [{ id, name, is_active }]
counterparties:[{ id, name, is_active }]
loans:         [{ id, direction: GIVEN|BORROWED, status: OPEN|PARTIALLY_REPAID|CLOSED,
                  amount, remaining, date_issued, counterparty_id, counterparty_name }]
```

Wire payloads the UI sends (dates = local `YYYY-MM-DD` → `${date}T00:00:00Z`; amounts = numbers; `bypass_warnings` only where the endpoint supports it):

| UI form | Endpoint | body |
|---|---|---|
| Expense | `POST /log/expense` | `{ description, transaction_date, category: string\|null, sources: [{account_id, amount}], bypass_warnings }` |
| Income | `POST /log/income` | `{ description, transaction_date, destinations: [{account_id, amount}] }` |
| Transfer | `POST /log/transfer` | `{ description, transaction_date, amount, from_account_id, to_account_id, bypass_warnings }` |
| Give loan | `POST /log/loan` | `{ description, transaction_date, counterparty, sources, bypass_warnings }` |
| Borrow | `POST /log/borrow` | `{ description, transaction_date, counterparty, destinations }` |
| Repay loan | `POST /log/loan-repayed` | `{ description, transaction_date, loan_id, sources, bypass_warnings }` |
| Receive repayment | `POST /log/borrow-returned` | `{ description, transaction_date, loan_id, destinations, bypass_warnings }` |

409 warnings (codes `INSUFFICIENT_BALANCE`, `REPAYMENT_DATED_BEFORE`) surface once at a time; resubmit same payload with the code appended to `bypass_warnings`; codes accumulate. Income/borrow never send the field.

---

## Architecture

```
BrowserRouter
└─ AuthProvider (existing, untouched)
   └─ ProfileProvider                    // fetches /profile when is_authenticated → true; clears on false
      └─ AddTransactionFlowProvider      // open-state + stage; renders <AddTransactionFlow/> after children
         └─ AnimatedRoutes               // pages unchanged; AppNavbar "+" calls useAddTransactionFlow().open()
```

- **ProfileProvider** (`hooks/providers/ProfileProvider.tsx` + `hooks/useProfile.ts`): `{ data, loading, error, refetch }`. StrictMode-safe via ref latch reset only when auth flips false. `refetch()` re-runs the fetch (fire-and-forget after each successful log).
- **AddTransactionFlowProvider** (`hooks/providers/AddTransactionFlowProvider.tsx` + `hooks/useAddTransactionFlow.ts`): `{ is_open, stage: "type_select"|"form", transaction_type, open, close, selectType, backToTypes }`; auto-closes when `!is_authenticated`. Renders context + `<AddTransactionFlow/>` above the routes so the open sheet survives navigation.
- **AddTransactionFlow** (`components/transactions/AddTransactionFlow.tsx`): one `Sheet`; stage type_select → body `TypeSelectorSheet`; stage form → body `TransactionFormView` keyed by `transaction_type` (fresh RHF each open).
- `constants/transactions.ts`: `TRANSACTION_TYPE_META` (icon/label/color/group), `CORE_TRANSACTION_TYPES`, `LOAN_TRANSACTION_TYPES`.

### Provider/flow state vs. routed remount
Provider and overlay mount above `AnimatedRoutes`, so navigating under an open sheet does not close it. `AppNavbar` lives inside routes but reads the flow context (mounted above) — allowed since context is an ancestor. Logout: auth flips false → effect closes flow and ProfileProvider clears data → no ghost overlay on the login screen.

---

## Files

**Modified:** `src/App.tsx` (nest providers), `src/components/layout/AppNavbar.tsx` (`+` onClick), `src/types/types.ts`, `src/types/schemas.ts`.

**New api/lib:** `src/api/ProfileApi.ts` (`ProfileAPI.getProfile`), `src/api/TransactionsApi.ts` (7 static log methods), `src/lib/format.ts` (`Format` static: `todayDateStr`, `toISODateTime`, `formatMoney` ₦).

**New providers/hooks:** `hooks/providers/ProfileProvider.tsx`, `hooks/useProfile.ts`, `hooks/providers/AddTransactionFlowProvider.tsx`, `hooks/useAddTransactionFlow.ts`, `hooks/useWarningBypass.ts`, `hooks/useFormErrors.ts`.

**New UI:** `components/ui/Sheet.tsx` (the one bottom-sheet primitive — portaled overlay + slide-up panel, back/title/close header), `components/transactions/AddTransactionFlow.tsx`, `components/transactions/TypeSelectorSheet.tsx`, `components/transactions/TransactionFormView.tsx`, `components/transactions/forms/{ExpenseForm,IncomeForm,TransferForm,GiveLoanForm,BorrowForm,RepayLoanForm,ReceiveRepaymentForm}.tsx`, `components/transactions/shared/{DescriptionField,DateField,AllocationRows,WarningBanner,ErrorBanner}.tsx`, `components/transactions/shared/pickers/{AccountPickerSheet,CategoryPickerSheet,CounterpartyPickerSheet,LoanPickerSheet}.tsx`, `constants/transactions.ts`.

Dead `components/ui/{button,dialog,dropdown-menu,input,tabs}.tsx` scaffold files stay untouched (their 5 `@base-ui/react` tsc errors remain the only red).

## Key designs

### types (`src/types/types.ts`) — flat, snake_case fields, no enums
`AccountType`, `LoanDirection`, `LoanStatus`, `WarningCode`, `TransactionType` (string unions); `ProfileAccount/Category/Counterparty/Loan/Data`; `ProfileContextValue`; `AddTransactionFlowContextValue`; wire payload types per the table (`ExpenseLogPayload`, …, `ReceiveRepaymentLogPayload`); prop types for `SheetProps`, picker sheets, shared fields (`ReactNode` import already present).

### schemas (`src/types/schemas.ts`) — single flat file, helpers no rule duplication
Module-scope zod helpers mirroring backend rules: `descriptionField` (required, trim, ≤100), `transactionDateField` (regex `YYYY-MM-DD`), `moneyField` (string, ≤2dp regex, positive), `accountIdField(label)`, `allocationRowField`, `allocationsField(label)` (≥1 row, unique account_id), `categoryField` (optional, "" = none, trim ≤100), `counterpartyField` (required, trim, ≤100), `loanIdField`. 7 form schemas composed from these; form value types = `z.infer`. Amounts/dates stay **strings** in form values; conversion to number / `T00:00:00Z` happens once in each form's `buildPayload`.

Allocation rows: each row form uses `useFieldArray<TFormValues, "sources"|"destinations">`, `defaultValues` seeds one empty row; row `account_id` registered then set via `setValue`, display via `watch`; per-row errors read `errors.sources?.[i]?.amount?.message`; duplicates surface via array `errors.sources?.root`.

### Sheet + pickers
`Sheet` renders through `createPortal(…, document.body)` so the framer slide-up transform never traps nested `position: fixed` pickers (each picker = its own portaled `Sheet`, appended later → stacks above). Category/counterparty pickers list existing names + free-text input ("Use "X"" / Add "X") — never calls a create endpoint. Loan picker filters `status !== CLOSED` and seeds direction (`repay_loan` → BORROWED, `receive_repayment` → GIVEN), rows show `counterparty_name` + `₦remaining`.

### Forms
Shared RHF+zod submit path per form: `handleSubmit(async values => { try { const codes = pending_warning ? confirm() : bypassed_codes; await TransactionsAPI.logX(buildPayload(values, codes)); reset(); await profile.refetch().catch(()=>{}); close(); } catch (err) { if (!handleError(err)) applyError(err); } finally { setBusy(false); } })`. Client zod messages inline; server `ApiError.fields` (slash paths e.g. `sources/0/amount`) normalized to dots and mapped via `setError(path as FieldPath<T>)`; non-field → banner. 409 WARNING → amber banner + submit relabels "Bypass & Save …"; `onChangeCapture` dismisses the pending toast (keeps accumulated codes). Warning wiring on the 5 supporting forms only.

---

## Build steps (each ends green: `cd twoside-ui && npx tsc --noEmit -p tsconfig.app.json` → only the 5 scaffold errors)

1. `types.ts`: all domain/context/payload/prop types.
2. `lib/format.ts` + `schemas.ts`: `Format` class; zod helpers + 7 schemas + inferred value types.
3. `api/ProfileApi.ts`, `api/TransactionsApi.ts`.
4. `components/ui/Sheet.tsx` (+ `SheetProps`).
5. `useProfile.ts` + `hooks/providers/ProfileProvider.tsx`; mount in `App.tsx`.
6. Flow shell: `useAddTransactionFlow.ts`, `AddTransactionFlowProvider.tsx`, `AddTransactionFlow.tsx`, `TypeSelectorSheet.tsx`, `TransactionFormView.tsx` (per-type placeholder), `constants/transactions.ts`; wire `AppNavbar` +; mount provider. `+` now opens the type sheet above routes and survives navigation.
7. Shared: `useWarningBypass.ts`, `useFormErrors.ts`, shared field/picker components + banners.
8. Core forms: Expense, Income, Transfer → wire in.
9. Loan-origin forms: GiveLoan, Borrow → wire in.
10. Repayment forms: RepayLoan, ReceiveRepayment → wire in; drop last placeholder.
11. Polish: verify + works on Home and Loans, success closes + refetches profile, logout closes flow/clears profile, repay warning accumulate; AGENTS.md roadmap checkbox optional.

## Verification (UI-only phase)

1. `cd twoside-ui && npx tsc --noEmit -p tsconfig.app.json` — no new errors beyond the 5 `components/ui/*` `@base-ui/react` module errors.
2. `npm run build` same expectation (typecheck gate).
3. Visual (`npm run dev`): log in → `+` opens "New Transaction" type sheet on Home and on Loans; selecting a type opens its form; navigating routes behind an open sheet does not close it; logout closes everything.
4. Full e2e (submit each of the 7) only possible once the user's backend change is live (name strings + `/profile`). Until then runtime log calls 400 by design — UI degrades gracefully: pickers show profile loading/empty states, forms still open and validate locally.
