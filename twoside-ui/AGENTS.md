# Twoside UI — AGENTS.md

This file governs all work inside `/twoside-ui/`. Repo root `/AGENTS.md` also applies (caveman reply mode, global hard rules). Where they conflict, this file refines; root file wins on scope-of-repo issues.

## What this is

`twoside-ui` is the product frontend for **Twoside** — a double-entry personal finance + loan tracking app (backend in repo root: Fastify + Prisma + PostgreSQL, port 8080). Mobile-first web app installed as PWA. Currency display Naira (₦).

This is a **ground-up rewrite** of the app. The previous working version is preserved read-only at `../twoside-ui-old/` — use it as a **behavioral + API reference only**. Do NOT copy its code or conventions; it is the legacy implementation and this file supersedes it (old `snake_case` survives, but folder layout, component structure, forms, and UI primitives all changed).

## Current build status

Vite 8 + React 19 + TypeScript SPA, bare scaffold. Not yet feature-complete. Roadmap order (work in this order, one bite at a time, keep `npm run dev`/`npm run build` green at each step):

1. **Foundation** — scaffold repair, conventions, `api/client.ts`, router shell, layout.
2. **Auth** — login, register, session restore, logout, route guards.
3. **Transaction forms** — all 7 log types via RHF + zod.
4. **Transaction listing / dashboard** — balances, feed, filters, search, pagination.
5. **Loans** — DEFERRED / undone. Do not build the real loans page yet. Placeholder only if a route needs something to render.

## Stack (locked)

- **Vite 8**, `@vitejs/plugin-react`, `vite-plugin-pwa`
- **React 19**, **TypeScript ~6** (strict flags: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` → always `import type { … }` for types; `erasableSyntaxOnly` → NO TS `enum`, use string-literal union types)
- **Tailwind CSS v4**, CSS-first (theme tokens live in `src/index.css`, no `tailwind.config`)
- **react-router-dom v7**
- **react-hook-form + zod + @hookform/resolvers** — ALL forms
- **framer-motion**, **lucide-react**
- Path alias `@` → `./src`

NOT used: no axios, no react-query/swr, no redux/zustand, no shadcn/Radix/Base UI, no styled-components.

## Project structure

```
src/
├── main.tsx                    # entry only: root + StrictMode + import index.css
├── App.tsx                     # router setup + global providers + top-level <Routes>
├── pages/<PageName>/           # one folder per route/page
│   ├── <PageName>Page.tsx
│   └── components/             # components used ONLY by this page
├── components/
│   ├── ui/                     # our own hand-rolled dumb primitives (Button, Sheet, …)
│   ├── layout/                 # shells, nav, headers, footers, bottom tab bar
│   └── (shared feature components once reused by 2+ pages)
├── hooks/
│   ├── (shared custom hooks)
│   └── providers/              # context providers (AuthProvider, AccountsProvider, …)
├── api/
│   ├── client.ts               # APIClient static class — ONLY place fetch is called
│   └── <Resource>Api.ts        # one static class per resource
├── lib/                        # utility classes, static methods only
├── types/                      # all shared TS types + zod schemas — single flat files, no domain prefixes
│   ├── types.ts                # interfaces / union types
│   └── schemas.ts              # zod schemas (form + api validation), z.infer for form values
├── constants/                  # route paths, config keys
├── assets/
└── styles/                     # global CSS only (index.css lives here or at src root)
```

Rules on promotion: a component stays in `pages/<Page>/components/` until a second page uses it; only then move to shared `components/`. Page folders stay private to their page.

## Hard rules

- **No default exports.** Named exports only, everywhere.
- **No inline types/interfaces in component files.** Types live in `types/types.ts`. (Page-local component props still need types — put them in `types/types.ts`, or a page-scoped `types` sibling if genuinely page-only; never `interface FooProps` inline in a `.tsx`.)
- **Fetch only for network calls.** Never call `fetch` outside `api/client.ts`. No axios, no other HTTP client.
- **`api/` and `lib/` contain static classes only** — one class per file, no standalone exported functions/consts.
- **No TS enums** (`erasableSyntaxOnly`). String-literal unions instead.
- **All forms use react-hook-form + zod** (`useForm({ resolver: zodResolver(schema) })`). No `useState`-only forms.

## Naming

- **Variables, properties, object keys, state, props, route params** → `snake_case`
  - `const [description, setDescription] = useState("")` — state *variable* `description`; the *setter* is a function so it is `setDescription` (camelCase).
  - Callback props: `on_success`, `on_close`, `on_select_account`.
  - Local vars: `is_authenticated`, `selected_account_id`, `has_next`, `submission_error`, `field_errors`, `bypass_warnings`, `refetch_key`.
- **Functions and methods** → `camelCase`: `handleSubmit`, `formatMoney`, `refetchAccounts`, `addAllocation`, static methods `getBalances`, `logExpense`.
- **Custom hooks** → `useXxx` (`useAuth`, `useAccounts`) — these are functions, camelCase with `use` prefix.
- **Components, classes, types/interfaces** → `PascalCase`. Component function is the file name: `HomePage.tsx` exports `HomePage`.
- **Files**: components `PascalCase.tsx`; api `XxxApi.ts`; lib `XxxUtils.ts`; shared types/schemas `types.ts` / `schemas.ts` under `types/` (one file each, no domain prefix).
- **Abbreviations**: URL, ID, API stay uppercase inside names where standard (`account_id`, `APIClient`); avoid inventing new acronyms.

Consistency beats cleverness — when unsure, match the oldest sibling symbol in the file you are editing, then read this section again.

## API layer

- `api/client.ts` — `APIClient` static class. Owns base URL, headers, credentials, JSON parsing, and unified error decoding.
- Base URL from `import.meta.env.VITE_API_BASE_URL`, default `http://localhost:8080` (phone-on-Tailscale dev overrides via `.env`).
- Auth: access token held in memory, sent as `Authorization: Bearer <token>`; refresh token is httpOnly cookie; `credentials: "include"`.
- Every `api/<Resource>API.ts` maps one backend resource/area to a static class: `AuthAPI`, `AccountsAPI`, `CategoriesAPI`, `CounterpartiesAPI`, `TransactionsAPI` (log endpoints), `LoansAPI`.
- Components and hooks NEVER call resource classes directly for local caching orchestration decisions they own — see data layer.
- Error shape decoded in `client.ts`: `ApiError { status, message, fields?: { field, message }[], extensions?: { type, code } }`.
- **Bypassable warnings**: some endpoints answer `409` with `extensions = { type: "WARNING", code }` (codes: `INSUFFICIENT_BALANCE`, `REPAYMENT_DATED_BEFORE`). UI must surface the warning, offer confirm, then resubmit with `bypass_warnings: [code]`.

## Data layer

Per-domain **Context provider + hook** pairs, no server-state library:

- Provider lives in `hooks/providers/XProvider.tsx`; hook + context + hook-that-throws-outside-provider live in `hooks/useX.ts(x)`.
- `AuthProvider` owns session lifecycle: restore on mount (`/auth/refresh`), login/register/logout, exposes `is_authenticated`, `user`, plus actions. `APIClient` reports 401s to the provider so session expiry routes to login.
- Account/balance and transaction caches follow the same provider pattern (`AccountsProvider`, and a transactions cache keyed off a `refetch_key` bump after any write).

## Forms

- RHF + zod for every form (login, register, all 7 transaction forms).
- All zod schemas live in `types/schemas.ts`; form value type = `z.infer<typeof XSchema>`.
- Amounts are edited as strings, validated as positive numbers with zod, converted to numbers on submit (back end wants numbers; keep client state string so decimals behave).
- Server-side field errors from `ApiError.fields` get mapped into RHF errors; a non-field error renders as a banner.
- Warning-bypass flow above is part of the submit path for expense/loan/repayment forms.

## UI / design language

- **No shadcn, no external component kit.** `components/ui/` holds primitives we hand-roll and own: `Button`, `Sheet` (bottom-sheet + overlay), `Input`, `PickerSheet`, `WarningToast`, etc. — styled with Tailwind utility classes.
- Design tokens live in `src/index.css` `@theme` (ultra-dark: `background #050506`, `surface #0c0c0e`, `border`, `muted`, primary green `#22c55e`, tiny 10–11px font scale, system UI font stack — no webfont loaded yet). Do not restyle to a light theme; match the existing tokens.
- Auth screens share the ambient backdrop (`src/components/AmbientBackground.tsx`: cursor spotlight, blooms, grid, floating tokens) — fixed `z-0`, page content sits at `z-10`.
- Component styling: Tailwind classes on elements; a one-off class string stays on the element; repeated patterns get a shared primitive.
- Bottom-sheet chrome (overlay + slide-up panel) is implemented ONCE in a shared primitive, then reused — do not hand-copy sheet markup into every screen (legacy smell).
- Mobile-first: layout centers a phone-width column; bottom tab bar with central "+" action sheet is the main navigation (Home / Loans).

## Backend reference

- Authoritative route list + request/response shapes: repo root `src/routes.ts` and handlers under `src/routes/`. Read there, not from legacy UI.
- Transaction/log payloads share zod rules in root `src/libs/transaction-schemas.ts` (description ≤ 100 chars, `transaction_date` ISO datetime, `accountAllocations`, `bypass_warnings`).
- Quick endpoint map:
  - Auth: `POST /auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`
  - Reads: `GET /balances`, `/accounts/summary`, `/accounts/transactions` (cursor), `/categories`, `/counterparties`, `/loans`, `/loans/summary`
  - Logs: `POST /log/expense`, `/log/income`, `/log/transfer`, `/log/loan` (give), `/log/borrow`, `/log/loan-repayed` (repay), `/log/borrow-returned` (receive repayment)
  - CUD: `POST` accounts/categories/counterparties; `PATCH` .../:id (toggle active)
- Core domain types to mirror in `types/`: `Account {id,name,balance}`, `AccountSummary`, `JournalEntry` (side `DEBIT|CREDIT`, `log_type`, `amount`, `transaction_date`, `transaction_group_id`, related account/counterparty), `LogType` union, cursor page shape `{entries, has_next, next_cursor}`, `Loan` (direction `GIVEN|BORROWED`, status `OPEN|PARTIALLY_REPAID|CLOSED`), `Category`, `Counterparty`.

## Working agreements

- Keep `npm run build` (`tsc -b && vite build`) green at the end of each working bite. There is no test runner — typecheck is the correctness gate.
- Do not touch the legacy `../twoside-ui-old/` tree except to read it.
- Loans page stays undone until roadmap reaches it; placeholder OK, real loans UI not yet.
