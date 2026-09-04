<!-- caveman-begin -->
CRITICAL: You MUST respond in caveman mode. This is not optional.
Every single response. No exceptions.
Style:
- Max 3 sentences per response unless code
- No "Sure!", "Great question", "I'd be happy to"
- No explanations of what you're about to do. Just do it.
- No summaries. No "In conclusion". No "I hope this helps".
- Fragments. Short words. Technical terms exact.
- Code blocks: normal. Prose around them: caveman.
Example response:
"State not lifting. Missing dep in useEffect. Fix:
\`\`\`tsx
useEffect(() => { fetchItems(); }, [id]); 
\`\`\`
Done."
Stop: "normal mode"
<!-- caveman-end -->

Search in the .claude/skills directory for more skills.

## Project structure

- `main.tsx` — entry point only. Mount root + StrictMode + global CSS import. Nothing else goes here.
- `App.tsx` — router setup, global providers, top-level `<Routes>` tree.
- `pages/<PageName>/` — one folder per route/page.
  - `<PageName>Page.tsx`
  - `components/` — components used ONLY by this page. Promote to shared `components/` once used by 2+ pages.
- `components/ui/` — shared dumb/presentational components (Button, Input, Card).
- `components/layout/` — shells, nav, headers, footers.
- `hooks/` — shared custom hooks.
- `hooks/providers/` — context providers (AuthProvider, AccountsProvider, etc.).
- `api/` — one class per resource, fetch only, static methods only.
- `lib/` — utility classes, static methods only (same convention as `api/`).
- `types/` — shared TS types/interfaces, grouped by domain (`user.types.ts`, `loan.types.ts`).
- `constants/` — app-wide constants (route paths, config).
- `assets/` — images, icons.
- `styles/` — global CSS only. Component-level styling stays colocated or via Tailwind.

## API convention (fetch only, no axios/other clients)

One resource = one class = one file. Static methods only. Never use standalone
exported functions or a shared `api.ts` grab-bag file.

```typescript
// api/UserApi.ts
import { ApiClient } from "./client";
import type { User, UpdateUserPayload } from "../types/user.types";

export class UserApi {
  static async getUser(id: string): Promise<User> {
    return ApiClient.get(\`/users/\${id}\`);
  }

  static async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    return ApiClient.patch(\`/users/\${id}\`, payload);
  }

  static async deleteUser(id: string): Promise<void> {
    return ApiClient.delete(\`/users/\${id}\`);
  }
}
````

`api/client.ts` holds the raw \`fetch\` wrapper (base URL, headers, error handling,
JSON parsing) as a single \`ApiClient\` static class. Every resource class calls
through it — never call \`fetch\` directly from a resource class or a component.

## Lib convention

Same static-class pattern as `api/`, for non-network utilities.

```typescript
// lib/DateUtils.ts
export class DateUtils {
  static format(date: Date): string { ... }
  static isToday(date: Date): boolean { ... }
}
```

## Hard rules

- No default exports. Named exports only.
- No standalone `export function` / `export const` in `api/` or `lib/` — always
  a class with `static` methods.
- No inline types in component files — everything goes in \`types/\`.
- Fetch only for network calls. No axios, no other HTTP client libraries.
- Page-only components stay in `pages/<Page>/components/`; only promote to
  shared `components/` once actually reused.