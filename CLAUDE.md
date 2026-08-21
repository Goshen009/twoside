# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`twoside` is the backend for a personal finance app built as a deliberate learning project in real accounting. It is a **double-entry bookkeeping system**: transactions are recorded as balanced journal entries, not as flat income/expense rows. Fastify 5 + Prisma 7 + PostgreSQL, TypeScript ESM. A Gemini-based natural-language extraction layer (turn "bought coffee 150" into a structured transaction) exists as a test harness but is not yet wired into the real transaction path.

**Scope of this file: the backend only** (`src/`, `prisma/`, `test/`, Docker). The repo also contains three unrelated/experimental frontend folders — `ui/`, `finance-tracker-ui/`, and `finance-tracker (5)/` — which are **out of scope**; ignore them unless explicitly asked.

## Commands

```bash
# FIRST TIME / after any schema change — generate the Prisma client.
# Nothing compiles until this exists; it is generated into src/generated/prisma (gitignored).
npx prisma generate

npm run dev        # tsc --watch + nodemon on dist/server.js (concurrently). Serves on :8080
npm run build:ts   # tsc -> dist/
npm start          # node dist/server.js (expects dist/ already built)

# Migrations (prisma.config.ts points schema at prisma/schema/, uses DIRECT_URL)
npx prisma migrate dev --name <name>
npx prisma migrate deploy

# Tests: build:ts -> typecheck test/ -> c8 coverage over node:test via ts-node
npm test
# Single test file (still needs a prior `npx prisma generate` + `npm run build:ts`,
# because src imports resolve through package.json "imports" to ./dist/...):
node --test -r ts-node/register test/path/to/file.ts

# Docker: docker-compose.yml is the DEV target only (mounts ./src + node_modules, runs npm run dev).
# The production image is the multi-stage build in Dockerfile (build target `prod`).
docker compose up
```

There is no linter configured for the backend. `README.md` is leftover Fastify-CLI boilerplate — its port (3000) is wrong; the server listens on **8080** (`src/server.ts`).

## Environment

Validated at boot by `src/plugins/env.ts` (zod); the process **exits** if any are missing/invalid:
- `ENVIRONMENT` — `development` | `production` | `staging` (dev enables pino-pretty debug logging)
- `DATABASE_URL` — runtime connection (Prisma `PrismaPg` adapter, pool max 20)
- `JWT_SECRET`
- `DIRECT_URL` — used only by `prisma.config.ts` for migrations (not validated by the env plugin)

## Architecture

### Boot chain
`src/server.ts` (Fastify instance, logger, graceful shutdown, `listen :8080`) → registers `src/app.ts` → `app.ts` autoloads `src/plugins/**` then `src/guards/**`, then registers `src/routes.ts`. `routes.ts` is a **manual, central route table** (URL → handler); handlers are plain `{ handler, schema }` objects, not self-registering plugins.

### Plugins & decorators (`src/plugins/`, all wrapped in `fastify-plugin`)
Decorators added here are the app's shared services, resolved off `this` (the `FastifyInstance`) inside handlers. Load order matters and is expressed via `dependencies`:
- `env` → decorates `fastify.config` (typed `Config`).
- `db` (deps: `env`) → decorates `fastify.prisma`.
- `zod` → installs `fastify-type-provider-zod` validator/serializer compilers (route `schema.body` uses zod v4).
- `error-handler` (deps: `sensible`) → global handler; see Error convention below.
- `cors` (deps: `error-handler`) → allowlist: `localhost:3000`, `localhost:5173`, `192.168.1.200:5173`.
- `sensible`, `support` — the latter is unused boilerplate.

### Auth guard (`src/guards/requireAuth.ts`)
Decorates `request.requireAuth()`. Every protected handler starts with `const user = await request.requireAuth()`. It verifies the Bearer JWT, loads the user + accounts, **caches on `request._user`**, and derives `user.defaults.recievables_account_id` / `payables_account_id` (throwing if those default accounts are absent). The returned `AuthenticatedUser` type is the contract the libs depend on.

### The domain model — read `.docs/` first
`.docs/overview.md` (accounting theory), `.docs/schema_design.md` (schema rationale), and `.docs/ui_flow.md` (intended UX) explain the *why* behind everything below. **Caveat:** the Prisma schema quoted inside those docs is explicitly marked "might be outdated" — the source of truth is `prisma/schema/schema.prisma`, which has since evolved (string `entry_group_id` became the `TransactionGroup` model; enums `EntrySide`/`AccountType`/`DefaultAccounts` were added; snapshot tables, multi-user `User`, `LoginAttempts`, and `TestChatMessage` were added).

Invariants that are enforced in code, not just documented:
- **Every transaction = one `TransactionGroup` + ≥2 `JournalEntry` rows**, sharing the group. Two rows is the simple case; more rows = a *compound entry* (e.g. one repayment split across loans).
- **Trial balance: total DEBIT must equal total CREDIT** before any write. Enforced in `log-transaction.ts` and in `Balance.trialBalance`.
- **Debit/credit sign convention:** ASSET & EXPENSE increase with DEBIT; LIABILITY, INCOME & EQUITY increase with CREDIT. This one rule is codified in three places — `Calc.resolve_delta`, `Balance.resolveEntrySide`, and inline in `LineValidation`. Keep them consistent.
- **Money is `Decimal(12,2)` in the DB but all arithmetic is done in integer cents** via `Calc.to_whole(n)` / `Balance.toWholeNumber` (`Math.round(n*100)`) to avoid float drift. Convert to cents → compute → divide by 100 on the way out.
- **Append-only journal:** never edit/delete `JournalEntry`; corrections are new reversing entries. Accounts/categories/counterparties are **disabled** (`is_disabled` / `is_active`), never deleted.

### Libs (`src/libs/`, barrel-exported from `index.ts`)
- `Calc` — money math + the **snapshot engine**. Balances/budgets are read as-of a date via *nearest snapshot + only the gap entries since* (`get_account_balance_at_date`, `get_budget_snapshot_totals`), never scanning from genesis. `generate_weekly_snapshot` writes `AccountBalanceSnapshot` + `BudgetSnapshot` per user and is **meant to run on a cron that does not exist yet** (see the shouty TODO in `routes.ts`).
- `LineValidation` — validates the three line families (account / loan-initiation / loan-repayment) against the DB, returning an ok/err `Result` union (not throwing). Loan-repayment validation tracks running per-loan totals across all lines in a request to catch overpayment that only appears in aggregate.
- `Balance` — an older/parallel helper (shared zod fields via `Balance.zod()`, `checkAccount`, `trialBalance`) used by the `/log/*` handlers.
- `JWT` (sign/verify, 2-day expiry), `Password` (argon2).

### Transaction pipeline — `POST /transactions` (`log-transaction.ts`) is the canonical path
Body: `{ description, trx_date, lines[] }`, where `lines` is a zod discriminated union on `kind`: `ACCOUNT`, `GIVE_LOAN`, `BORROW`, `RECEIVE_LOAN_REPAYMENT`, `REPAY_LOAN` (min 2 lines). Flow: `requireAuth` → validate each line family via `LineValidation` → assert trial balance → single `prisma.$transaction` that creates the `TransactionGroup` + `JournalEntry` rows (+ `Loan` / `LoanRepayment` rows), recomputes affected `Loan.status` (OPEN → PARTIALLY_REPAID → CLOSED), and **retroactively adjusts snapshots** if `trx_date` lands before an existing snapshot.

Loan lines never take an account id from the client — they resolve to the user's default RECEIVABLES (given) or PAYABLES (borrowed) account. The `Loan`/`LoanRepayment` tables sit *alongside* the journal to answer "which specific loan does this repayment close," each row carrying its `transaction_group_id` back to the journal event.

> **Work in progress:** `routes.ts` also registers `/log/expense`, `/log/income`, `/log/loan`, `/log/borrow`, `/log/loan-repayed`, `/log/borrow-returned` with **empty handlers**. Only `/log/transfer` (`src/routes/logs/log-transfer.ts`) is implemented. These granular `/log/*` endpoints (built on `Balance`) are a half-finished alternative to the unified `/transactions` endpoint (built on `LineValidation` + `Calc`). Confirm which path is intended before extending either.

### AI extraction (`test-gemini-chat.ts`) — test harness, not production
`POST /test/gemini-chat` calls Gemini `gemini-3.5-flash-lite` over REST, injecting the user's accounts/categories/counterparties/open-loans into the system prompt, persisting turns to `TestChatMessage`, and constraining the model to one of three JSON shapes (`continuation` / `success` / `refused`) whose `success` shape mirrors the `/transactions` line schema. The `API_KEY` is a hardcoded empty string — it is a scaffold and is **not** yet connected to the real transaction endpoint.

### Auth model
Username + **6-digit PIN** (argon2-hashed). Register/login return the token in the `Authorization` response header. `login.ts` implements exponential-backoff lockout via `LoginAttempts` (5 failures → 5 min, doubling, capped at 24h; cleared on success). `GET /seed` creates a fixed dev user `goshen` / PIN `000000` with the 8 default accounts + 2 categories. New users get the same 8 default accounts on register: Cash, Bank, Equity, Savings, Income, Expense, Payables, Recieveables — note **"Recieveables" is (consistently) misspelled** in code; match the existing spelling when referencing it.

### Error convention
Handlers `throw APIError.*()` (from `src/errors/APIError.ts`) which produces a `ProblemDetail` (has `status` / `message` / optional `extensions`, and a `toJSON`). The `error-handler` plugin is the only place that touches `reply` for errors — it serializes `ProblemDetail`, malformed-JSON errors, and zod validation failures into a uniform body; anything else becomes a logged 500. Do not format error responses inside handlers.

## Conventions & gotchas
- **ESM + `nodenext`:** relative imports use `.js` extensions even though the files are `.ts` (e.g. `import ... from './calc.js'`).
- **Subpath imports:** `#/prisma/*`, `#/plugins/*`, `#/guards/*`, `#/errors/*`, `#/libs/*`. `package.json` `imports` maps these to `./dist/...` (runtime); `tsconfig.json` `paths` maps them to `src/...` (typecheck). Prisma is imported as `#/prisma/client.js` / `#/prisma/enums.js`.
- **`src/generated/prisma` is gitignored** and produced by `npx prisma generate`; a fresh checkout will not typecheck or build until you run it.
- zod is imported from `zod/v4` (or `"zod"`, v4 line) throughout.
