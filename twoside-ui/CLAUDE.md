# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server (host exposed; see allowedHosts in vite.config.ts)
npm run build    # tsc -b (typecheck) then vite build
npm run lint     # eslint .
npm run preview  # serve the production build on port 5173
```

There is no test runner configured (no test script, no vitest/jest). `npm run build` is the only correctness gate — it typechecks the whole project via `tsc -b` before bundling.

## Active source tree

`src/` is the application. `src_3/` is a near-identical parallel copy that is **not part of the build** — it is not referenced by `index.html`, not in the `@` alias, and not in `tsconfig.app.json`'s `include`. Editing `src_3/` has no effect on the app. Ignore it unless explicitly asked to work there.

## Stack

Vite 8 + React 19 + TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite` — there is no `tailwind.config`; theme lives in `src/index.css`), shadcn components in the **`base-nova`** style built on **`@base-ui/react`** (not Radix), react-router v7, and `vite-plugin-pwa` (autoUpdate). Currency is Naira (₦); the app is a personal finance & loan tracker.

## Architecture

**Entry / routing** — `index.html` → `src/main.tsx` → `src/App.tsx`. `App.tsx` holds all routing and auth gating: `AuthProvider` wraps everything; unauthenticated users are bounced to `/login`; the authenticated `ProtectedLayout` nests `AccountsProvider` → `TransactionsCacheProvider` around the routed pages.

**Data layer** — two files under `src/libs/api/`:
- `cilent.ts` (filename typo is real — import it as-is) exports `APIClient`, a `fetch` wrapper. The access token is held **in memory only** as a static field; requests send `Authorization: Bearer` plus `credentials: "include"` (the refresh token is an httpOnly cookie). `ApiError` carries `status` and a `fields` array for per-field validation errors. **The API base URL is hardcoded here**, not read from `.env`.
- `api.ts` exports `API`, a static class with one method per endpoint. Transaction logging maps to endpoints whose names differ from the UI labels: give loan → `/log/loan`, receive repayment → `/log/borrow-returned`, repay loan → `/log/loan-repayed`.

**State / data fetching** — no react-query/swr. Each domain is a Context + `useX` hook pair (e.g. `useAccounts`, `useLoans`, `useCategories`), with providers in `src/hooks/providers/`. Hooks throw `"useX must be used within XProvider"` when used outside their provider. `TransactionsCacheProvider` is a hand-rolled in-memory cache keyed by string (`getList`/`setList`, `getSummary`/`setSummary`).

**Forms** — react-hook-form, zod, and `@hookform/resolvers` are installed, but the transaction forms in `src/components/transactions/forms/` use plain `useState` + a manual `handleSubmit`. Validation is **server-driven**: `useFormErrors` (`applyError`) maps `ApiError.fields` onto `field_errors` and a `banner_error`. Softer server warnings come back as 409s with `extensions: { type: "WARNING", code }`; transaction forms handle them via `useWarningBypass` + `WarningToast` — the toast shows the message, the submit button flips to a "Bypass & …" action, and confirmed codes accumulate into `bypass_warnings` (a `string[]`, one code at a time per submit). Follow these patterns when adding forms; don't assume rhf/zod wiring exists.

**UI** — mobile-first. Interactions use bottom sheets / drawers / pickers (`PickerSheet`, `*Sheet`, `FilterDrawer`); shared form fields live under `forms/shared/`. framer-motion for animation, lucide-react for icons.

## Conventions

- **snake_case for all identifiers** — variables, state, props, and callbacks (`is_authenticated`, `on_success`, `set_description`, `refetch_accounts`). This is project-wide; match it rather than the usual React camelCase.
- **Two util directories, both real:** `@/lib/utils` holds shadcn's `cn` (used by `components/ui/*`); `@/libs/*` holds app logic (`api`, `format`, `transaction-style`, `form-error`). The `@` alias points to `src/`, but app code frequently uses relative imports too.
- React Compiler is intentionally not enabled, and type-aware ESLint (the README's suggested upgrade) is not applied.
