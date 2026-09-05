# Twoside UI — AGENTS.md

This file governs all work inside `/twoside-ui/`. Repo root `/AGENTS.md` also applies (caveman reply mode, global hard rules). Where they conflict, this file refines; root file wins on scope-of-repo issues.

## What this is

`twoside-ui` is the product frontend for **Twoside** — a double-entry personal finance + loan tracking app (backend in repo root: Fastify + Prisma + PostgreSQL, port 8080). Mobile-first web app installed as PWA. Currency display Naira (₦) — read from `GET /info` at runtime.

This is a **ground-up rewrite** of the app. The previous working version is preserved read-only at `../twoside-ui-old/` — use it as a **behavioral + API reference only**. Do NOT copy its code or conventions; it is the legacy implementation and this file supersedes it.

## Current build status

Vite 8 + React 19 + TypeScript SPA. Not yet feature-complete. Roadmap order (work in this order, one bite at a time, keep `npm run dev`/`npm run build` green at each step):

1. **Foundation** — DONE. Scaffold, `api/client.ts`, router shell, layout.
2. **Auth** — DONE. Login, register, session restore, logout, route guards (`PublicOnlyRoute`, `ProtectedLayout`).
3. **Transaction forms** — DONE. All 7 log types via RHF + zod. ⚠️ This stage was written with a `snake_case`-for-everything local style that **contradicts the Naming section below** — treat it as legacy drift, do not copy it (details under Naming).
4. **Transaction listing / dashboard** — NOT STARTED. Balances, feed, filters, search, pagination.
5. **Loans** — DEFERRED. `LoansPage` is a placeholder only; no real loans UI.

The frontend currently consumes only: auth endpoints, `GET /info` (one aggregate read for accounts/categories/counterparties/open loans/currency), and the 7 `/log/*` write endpoints. No read pages exist yet, so the backend listing endpoints are not consumed yet.

## Stack (locked)

- **Vite 8**, `@vitejs/plugin-react`, `vite-plugin-pwa`
- **React 19**, **TypeScript ~6** (strict flags: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` → always `import type { … }` for types; `erasableSyntaxOnly` → NO TS `enum`, use string-literal union types)
- **Tailwind CSS v4**, CSS-first (theme tokens live in `src/index.css`, no `tailwind.config`)
- **react-router-dom v7**
- **react-hook-form + zod + @hookform/resolvers** — ALL forms
- **framer-motion**, **lucide-react**
- Path alias `@` → `./src`

NOT used at runtime: no axios, no react-query/swr, no redux/zustand, no shadcn/Radix/Base UI, no styled-components. (`components.json`, `class-variance-authority`, `clsx`, `tailwind-merge`, and the commented-out `components/ui/{button,dialog,dropdown-menu,input,tabs}.tsx` + `lib/utils.ts` are dead shadcn-scaffold leftovers — see UI section; delete when cleaning, never build on them.)

## Project structure

```
src/
├── main.tsx                          # entry only: root + StrictMode + import index.css
├── App.tsx                           # router setup + global providers + top-level <Routes>
├── pages/<PageName>/                 # one folder per route/page
│   └── <PageName>Page.tsx            # today each page is a single file; no page-local components yet
├── components/
│   ├── ui/                           # hand-rolled dumb primitives: Sheet, PickerSheet,
│   │                                 #   LoanPickerSheet, WarningToast (PascalCase.tsx)
│   ├── layout/                       # AppNavbar (bottom tab bar)
│   ├── transactions/                 # feature UI shared across pages via the add-transaction flow
│   │   ├── AddTransactionFlow.tsx
│   │   ├── TransactionFormView.tsx
│   │   ├── TypeSelectorSheet.tsx
│   │   ├── forms/<Type>Form.tsx      # one per log type (Expense, Income, Transfer, …)
│   │   └── forms/shared/*.tsx        # row/field pieces reused by several forms
│   ├── AmbientBackground.tsx         # app-shell backdrop (auth screens)
│   └── PageTransition.tsx            # app-shell animation wrapper
├── hooks/                            # shared custom hooks + their providers, MERGED one file per domain
│   ├── useAuth.tsx                   # AuthProvider + useAuth
│   ├── useInfo.tsx                   # InfoProvider + useInfo (GET /info cache)
│   ├── useAddTransactionFlow.tsx     # AddTransactionFlowProvider + useAddTransactionFlow (UI state only)
│   └── useWarningBypass.ts           # plain hook (no provider)
├── api/
│   ├── client.ts                     # APIClient static class + ApiError — ONLY place fetch is called
│   ├── AuthApi.ts                    # class AuthAPI
│   ├── InfoApi.ts                    # class InfoAPI
│   └── TransactionsApi.ts            # class TransactionsAPI (the 7 /log/* writes)
├── lib/
│   ├── FormatUtils.ts                # class FormatUtils (static methods)
│   └── utils.ts                      # DEAD shadcn leftover (cn) — delete when cleaning, don't import
├── types/                            # all shared TS types + zod schemas — single flat files
│   ├── types.ts                      # domain mirrors (Info*), Log* payloads, prop types, context values
│   └── schemas.ts                    # zod schemas + z.infer form-value types
├── constants/
│   └── transactions.ts               # transaction-type metadata + type arrays
├── index.css                         # Tailwind + @theme tokens live at src root
└── (no assets/ or styles/ dir yet)
```

Rules on placement:
- New UI that only one screen/surface owns starts inside that owning folder; when a second unrelated surface reuses it, promote it up. Today the shared surface is the add-transaction flow, so cross-form pieces live under `components/transactions/forms/shared/` and reusable picker chrome under `components/ui/`. Page folders stay private to their page.
- A provider and its hook are co-located in one file: `hooks/useX.tsx` exports both `<XProvider>` and `useX`. There is no `hooks/providers/` directory.
- All schema-typed UI prop types, context value types, and shared domain mirrors go in `types/types.ts`; all zod schemas go in `types/schemas.ts`.

## Hard rules

- **No default exports.** Named exports only, everywhere.
- **No `interface` and no TS `enum` anywhere.** Types are `type` aliases; unions are string-literal unions.
- **Shared props types live in `types/types.ts`** — never `interface FooProps` / a `FooProps` `type` inline in a `.tsx` for a shared or page-level component. Exception: genuinely file-local derived shapes (a form's `SourceRow`/error-map keyed by row index, a picker-target union, a local union like `StageDirection`) are declared as `type` aliases inline, next to the component that owns them.
- **Fetch only for network calls.** Never call `fetch` outside `api/client.ts`. No axios, no other HTTP client.
- **`api/` and `lib/` contain static classes only** — one class per file, no standalone exported functions/consts. (`lib/utils.ts` `cn` is the one known dead exception; delete it, don't add siblings.)
- **All forms use react-hook-form + zod** (`useForm({ resolver: zodResolver(schema) })`). No `useState`-only forms.

## Naming

- **Variables, properties, object keys, state, props, route params** → `snake_case`
  - `const [description, setDescription] = useState("")` — state *variable* `description`; the *setter* is a function so it is `setDescription` (camelCase). Setter always camelCase: `setIsFetching`, `setBannerError`, never `set_*`.
  - Callback props: `on_success`, `on_close`, `on_select_account`.
  - Local vars: `is_authenticated`, `selected_account_id`, `has_next`, `submission_error`, `field_errors`, `bypass_warnings`, `refetch_key`.
- **Functions and methods → `camelCase`.** This includes component-internal handlers and module-local helper functions: `handleSubmit`, `handleAccountClick`, `applyServerErrors`, `sanitizeAmountInput`, `formatMoney`, static methods `getInfo`, `logExpense`.
- **Custom hooks** → `useXxx` (`useAuth`, `useInfo`) — these are functions, camelCase with `use` prefix.
- **Context-value actions are methods** → camelCase: `login`, `logout`, `open`, `close`, `refetch`, `selectType`.
- **Components, classes, types** → `PascalCase`. Component function is the file name: `HomePage.tsx` exports `HomePage`. API class is `PascalCase` + uppercase acronym: file `AuthApi.ts` exports `class AuthAPI`.
- **Constants**: file-scope/module constants → `SCREAMING_SNAKE` (`BLANK_SOURCE`, `CARD_CLASSES`, `DEFAULT_ACCENT`, `ENTER_SHIFT`, and the exported maps in `constants/transactions.ts`: `TRANSACTION_TYPE_META`, `CORE_TRANSACTION_TYPES`). Zod schema singletons are the one camelCase exception (`expenseFormSchema`, `loginSchema`) because they pair with `z.infer<typeof XSchema>`.
- **Files**: components `PascalCase.tsx`; api `XxxApi.ts`; lib `XxxUtils.ts`; shared types/schemas `types.ts` / `schemas.ts` under `types/`.
- **Abbreviations**: URL, ID, API stay uppercase inside names where standard (`account_id`, `APIClient`, `AuthAPI`); avoid inventing new acronyms.

> **Legacy-drift warning (important):** the transaction-forms stage (everything under `components/transactions/forms/`, `components/transactions/AddTransactionFlow.tsx`, `TypeSelectorSheet.tsx`, and the flow hook `useAddTransactionFlow.tsx`) was written `snake_case`-heavy: setters `set_is_submitting`, `set_stage`, `set_direction`; handlers/helpers `handle_account_click`, `apply_server_errors`, `sanitize_amount_input`, `set_sources`, `render_type_row`; context actions `select_type`, `back_to_types`. **This contradicts the rules above. Do not copy it.** When you edit one of those files, migrate the symbols you touch to camelCase in the same bite. If unsure what a name should be, follow this section — not the sibling symbol beside it.

## API layer

- `api/client.ts` — `APIClient` static class. Owns base URL, headers, credentials, JSON parsing, unified error decoding, and session refresh.
- Base URL from `import.meta.env.VITE_API_BASE_URL`, default `http://localhost:8080` (phone-on-Tailscale dev overrides via `.env`).
- Auth: access token held in memory, sent as `Authorization: Bearer <token>`; refresh token is httpOnly cookie; `credentials: "include"`. Login/register take the fresh access token from the `Authorization` response header (`APIClient.extractAccessToken`).
- Session restore/refresh happens in `APIClient.refresh()` (`POST /auth/refresh`), not in `AuthAPI`. `APIClient.onUnauthorized` is a static callback that `AuthProvider` sets on mount, so 401/session expiry flips `is_authenticated` to false and routes to `/login`.
- One static class per resource, all calling through `APIClient.request<T>`: `AuthAPI` (`api/AuthApi.ts`), `InfoAPI` (`api/InfoApi.ts`), `TransactionsAPI` (`api/TransactionsApi.ts`). `TransactionsAPI` exposes one method per log type: `logExpense`, `logIncome`, `logTransfer`, `logGiveLoan`, `logBorrow`, `logRepayLoan`, `logReceiveRepayment`.
- **No per-resource classes for accounts/categories/counterparties/loans yet.** Reference data is read once as one aggregate `GET /info` and served through the info cache (below).
- Error shape decoded in `client.ts` as `ApiError { status, message, fields?: { field, message }[], extensions }`, where `extensions` is a `Record<string, unknown>`. 409 warnings carry `extensions.type === "WARNING"` and a string `extensions.code`.
- **Bypassable warnings**: backend answers `409` with `{ type: "WARNING", code }` (codes include `INSUFFICIENT_BALANCE`, `REPAYMENT_DATED_BEFORE`). UI surfaces the warning, offers confirm, then resubmits with `bypass_warnings: [code]`. Shared logic lives in `useWarningBypass()`.

## Data layer

No server-state library. Providers and their hooks live **merged** in one file each under `hooks/`. The three providers compose in `App.tsx` (`AuthProvider` → `InfoProvider` → `AddTransactionFlowProvider`):

- `AuthProvider` (`useAuth.tsx`) owns session lifecycle: restore on mount via `APIClient.refresh()`, login/register/logout, exposes `is_authenticated` plus `login`/`register`/`logout`. Wires `APIClient.onUnauthorized`.
- `InfoProvider` (`useInfo.tsx`) is the app-wide reference-data cache. It fetches `GET /info` once per login session and exposes `{ data, loading, is_refreshing, error, refetch }`. `data` is `InfoData | null`: `{ currency, IANA, accounts, categories, counterparties, open_loans }`. A `request_seq` ref guard drops stale in-flight completions across login/logout, and cache is cleared on session end.
- Writes go through the owning `TransactionsAPI` method inside the form's submit, then the form `await refetch()`s the info cache. There is no per-write transaction cache and no `refetch_key` bump yet — add one only when a listing/dashboard read needs it.
- `AddTransactionFlowProvider` (`useAddTransactionFlow.tsx`) is **UI state only** (open/close, stage, selected `transaction_type`), not data. It resets to closed on session end. `AddTransactionFlow` renders the sheet (type selector → form) and is mounted once in `App.tsx`.

## Forms

- RHF + zod for every form (login, register, all 7 transaction forms).
- All zod schemas live in `types/schemas.ts`; form value type = `z.infer<typeof XSchema>` (exported as e.g. `ExpenseFormValues`).
- Amounts are edited as strings, validated as positive numbers with zod, converted to numbers on submit (back end wants numbers; keep client state string so decimals behave).
- Server-side field errors from `ApiError.fields` get mapped into RHF errors (field names arrive as backend paths; convert `/` → `.` before `setError`); a non-field error renders as a banner.
- Each transaction form: one `useForm`, allocations (sources/destinations) managed via whole-array `setValue` in a `set_sources`/`set_destinations`-style helper (rename to camelCase when touched), `PickerSheet`/`LoanPickerSheet` for account/category/counterparty/loan picking, `WarningToast` for pending warnings. Warning-bypass is part of the submit path for expense/loan/repayment forms.
- After a successful write the form calls `refetch()` (info cache), then `on_success` (closes the sheet).

## UI / design language

- **No shadcn at runtime.** `components/ui/` holds primitives we hand-roll and own: `Sheet.tsx` (bottom-sheet chrome: overlay + slide-up panel), `PickerSheet.tsx` (searchable single-select with optional create), `LoanPickerSheet.tsx` (open-loan picker showing outstanding balance), `WarningToast.tsx`. Styled with Tailwind utility classes.
- **Dead shadcn-scaffold leftovers — delete when cleaning, never extend:** `components/ui/{button,dialog,dropdown-menu,input,tabs}.tsx` are fully commented-out Base UI stubs; `lib/utils.ts` (`cn`), `components.json`, and deps `class-variance-authority`, `clsx`, `tailwind-merge` exist only for them.
- There is **no shared `Button`/`Input` primitive yet** — buttons are styled inline with Tailwind, and text/amount inputs live in the shared transaction field components under `components/transactions/forms/shared/` (`DescriptionField`, `DateTimeField`, `AllocationsList`, `NameField`, `LoanField`) plus raw `<input>` in pages/pickers. Build a shared primitive only when a pattern repeats across unrelated surfaces.
- Design tokens live in `src/index.css` `@theme` (ultra-dark: `background #050506`, `surface #0c0c0e`, `surface-hover`, `border #1f1f23`, `muted`, `ring`, `foreground`, primary green `#22c55e` + `primary-hover`/`primary-muted`, 10–11px font scale (`2xs`/`xs`), system UI font stack — no webfont loaded yet). Do not restyle to a light theme; match the existing tokens.
- Auth screens share the ambient backdrop (`src/components/AmbientBackground.tsx`: cursor spotlight, blooms, grid, floating tokens) and `PageTransition` — fixed `z-0`, page content sits at `z-10`.
- Component styling: Tailwind classes on elements; a one-off class string stays on the element; repeated patterns get a shared primitive.
- Bottom-sheet chrome (overlay + slide-up panel) is implemented ONCE in `Sheet.tsx` and reused — do not hand-copy sheet markup into every screen (legacy smell).
- Mobile-first: layout centers a phone-width column; `AppNavbar` bottom tab bar is the main navigation — Home, Loans, central "+" (opens the add-transaction sheet), History (placeholder), Log out.

## Backend reference

- Authoritative route list + request/response shapes: repo root `src/routes.ts` and handlers under `src/routes/`. Read there, not from legacy UI.
- Transaction/log payloads share zod rules in root `src/libs/transaction-schemas.ts` (description ≤ 100 chars, `transaction_date` ISO datetime, `accountAllocations`, `bypass_warnings`).
- Quick endpoint map:
  - Auth: `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`
  - Aggregate read (consumed today): `GET /info`
  - Future reads (for roadmap stage 4): `GET /balances`, `/accounts/summary`, `/accounts/transactions` (cursor), `/categories`, `/counterparties`, `/loans`, `/loans/summary`
  - Logs: `POST /log/expense`, `/log/income`, `/log/transfer`, `/log/loan` (give), `/log/borrow`, `/log/loan-repayed` (repay), `/log/borrow-returned` (receive repayment)
  - CUD: `POST` accounts/categories/counterparties; `PATCH .../:id` (toggle active)
- The UI mirrors backend wire shapes in `types/types.ts` as `Info*` types: `InfoAccount { id, name, balance }`, `InfoCategory { id, name }`, `InfoCounterparty { id, name }`, `InfoLoan { id, amount, status, direction, date_issued, counterparty_id, counterparty_name, total_repaid }` (direction `GIVEN|BORROWED`; status `OPEN|PARTIALLY_REPAID` — `/info` only returns open loans, never `CLOSED`), `InfoData { currency, IANA, accounts, categories, counterparties, open_loans }`, plus per-endpoint `Log*Payload` types (`LogExpensePayload`, `LogTransferPayload`, …). Journal-entry / cursor-page / full-`Loan` domain types get added when the listing/dashboard and loans stages land.

## Working agreements

- Keep `npm run build` (`tsc -b && vite build`) green at the end of each working bite. There is no test runner — typecheck is the correctness gate.
- Do not touch the legacy `../twoside-ui-old/` tree except to read it.
- Loans page stays a placeholder until the roadmap reaches it.
- When editing a file in the legacy-drift snake_case cluster (forms, `AddTransactionFlow.tsx`, `TypeSelectorSheet.tsx`, `useAddTransactionFlow.tsx`), rename only the symbols you actually touch to camelCase; leave untouched symbols alone so the file stays green.
