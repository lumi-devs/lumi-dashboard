# Testing Patterns & Conventions

Tests mirror `src/` under `tests/` and execute via `bun test --parallel`.

---

## 1. Test Environment & Preloads

Configured in `bunfig.toml`:
1. `tests/happydom-register.ts`: Registers DOM globals (`window`, `document`, `navigator`) via `@happy-dom/global-registrator`.
2. `tests/setup.ts`: Registers process-wide mocks before any test modules resolve.

### Shared Global Mocks in `tests/setup.ts`
- `server-only`: Mocked to a no-op so server files can be tested in Bun.
- `#/lib/auth`: Mocks `auth()` to return a default test user.
- `next/navigation`: Mocks `useRouter`, `usePathname`, `useSearchParams`, `redirect`.
- `#/actions/guild-actions`: Provides shared mock spies (`guildActionsMock`).

---

## 2. Testing Components with TanStack Query

Hooks or components that use `@tanstack/react-query` must be wrapped in a `QueryClientProvider` configured with retries disabled:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
```

Use `waitFor(...)` from `@testing-library/react` to await asynchronous query/mutation state changes:

```tsx
const { result } = renderHook(() => useModuleConfig("g1", "moderation"), {
  wrapper: createTestQueryWrapper(),
});

await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

---

## 3. Mocking Application Use Cases & Ports

When testing pages or presentation components, mock at the use case level (`src/application/`) rather than mocking raw network calls:

```ts
import { vi } from "bun:test";

vi.mock("#/application", () => ({
  getGuildOverview: vi.fn().mockResolvedValue(mockGuildOverview),
  updateModuleConfig: vi.fn().mockResolvedValue({ ok: true }),
}));
```

---

## 4. Execution Commands

- `bun test` — Runs the full test suite in parallel.
- `bun test tests/modules/hooks.test.tsx` — Runs a specific test file.
- `bun test --watch` — Runs tests in watch mode during development.
