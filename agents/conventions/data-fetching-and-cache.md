# Data Fetching & Caching Conventions

Client-side data fetching, caching, and mutation state are centralized via `@tanstack/react-query`.

---

## 1. Root Setup

`QueryProvider` (`src/components/query-provider.tsx`) wraps the application in `src/app/layout.tsx`:

- Default query cache `staleTime`: 30 seconds.
- `refetchOnWindowFocus`: disabled by default to prevent erratic refetches during modal/tab changes.
- `retry`: 1 automatic retry on failure.

---

## 2. Module Hooks (`src/modules/hooks/`)

Never fetch module configurations via raw `useEffect` in individual components. Always use the standardized hooks.

### Reading Data: `useModuleConfig`
```tsx
const { config, isLoading, error, refresh, setConfig } = useModuleConfig({
  guildId,
  moduleName: "moderation",
  initialConfig, // Passed from server component
});
```
- Backed by TanStack Query's `useQuery`.
- Query key: `["moduleConfig", guildId, moduleName]`.
- Provides optimistic local overrides (`setConfig`) while editing forms.

### Mutating Data: `useUpdateModuleConfig`
```tsx
const { updateConfig, updateField, isPending, error } = useUpdateModuleConfig({
  guildId,
  moduleName: "moderation",
  onSuccess: () => toast.success("Settings saved"),
});

// Save multiple fields:
await updateConfig({ logChannelId: "123", dmOnAction: true });

// Save a single field:
await updateField("dmOnAction", false);
```
- Backed by TanStack Query's `useMutation`.
- Automatically calls `queryClient.invalidateQueries` upon success to synchronize active views across tabs and sidebars.

---

## 3. Server Actions Delegation

Server action files (`src/actions/*.ts`) execute on the server.
To maintain architectural boundaries, Server Actions MUST NOT call raw RPC directly. They must delegate to `src/application/` use cases:

```ts
// src/actions/guild-actions.ts
export async function getGuildModuleConfig(guildId: string, moduleName: string) {
  return guildAction(guildId, async (session) => {
    const config = await appGetModuleConfig(guildId, session.userId, moduleName);
    return { ok: true, config };
  });
}
```
