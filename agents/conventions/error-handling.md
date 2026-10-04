# Error Handling & Boundaries

The application uses a unified error model and boundary components to ensure failures are predictable, typed, and user-friendly.

---

## 1. Unified `AppError` Hierarchy

Defined in `src/core/errors/AppError.ts`:

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
```

### Typed Error Subclasses
- `PermissionDeniedError` (`code: 'PERMISSION_DENIED'`, 403)
- `GuildNotFoundError` (`code: 'GUILD_NOT_FOUND'`, 404)
- `ModuleUnavailableError` (`code: 'MODULE_UNAVAILABLE'`, 400)
- `ValidationError` (`code: 'VALIDATION_FAILED'`, 422)
- `RateLimitedError` (`code: 'RATE_LIMITED'`, 429)
- `RpcCommunicationError` (`code: 'RPC_ERROR'`, 502)

---

## 2. Server Action Results

Server Actions return a standardized `ActionResult`:

```ts
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code?: string };
```

Components consume this through `useUpdateModuleConfig` or `useServerAction`, eliminating raw exception crashes on the client.

---

## 3. The `<ModuleBoundary>` Lifecycle Pattern

Wrap module pages or subsections with `<ModuleBoundary>` (`src/components/layout/ModuleBoundary.tsx`):

```tsx
<ModuleBoundary
  moduleId="moderation"
  capability="moderation.view"
  isLoading={isLoading}
  error={error}
  onRetry={refresh}
>
  <ModerationContent />
</ModuleBoundary>
```

### Standard States Handled:
1. **Loading**: Renders animated skeleton rows matching page layout.
2. **Disabled / Not Installed**: Displays prompt informing the admin that the module is currently turned off for this server.
3. **Unauthorized**: Displays permission denial if user lacks the required capability.
4. **Error**: Displays an error card with error code and an optional retry callback.
5. **Available**: Renders children once all conditions pass.
