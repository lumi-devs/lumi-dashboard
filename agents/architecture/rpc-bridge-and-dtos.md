# RPC Bridge & DTO Separation

`lumi-dashboard` talks to Lumi's `apps/api` over an internal HTTP bridge. It never touches PostgreSQL, Valkey, or Discord gateways directly.

---

## 1. Transport Bridge & Security

- **Endpoint**: Internal HTTP endpoint configured via `RPC_HTTP_URL` (defaults to `http://127.0.0.1:8081`).
- **Secret Handshake**: Authenticated on every request with the pre-shared secret `RPC_SHARED_SECRET` in header `x-rpc-secret`.
- **Server-Only Restriction**: The client browser never communicates directly with `apps/api`. All calls must route through Next.js server components or Server Actions via `src/lib/rpc.ts`.

---

## 2. DTOs vs Domain Entities

Never leak raw RPC response wire shapes into React components or domain logic.

```text
Lumi apps/api (Wire JSON)
       │
       ▼
   Wire DTO (from @lumi/contracts)
       │
       ▼
src/infrastructure/rpc/mappers/
       │
       ▼
Pure Domain Entity (src/domain/guild/Guild.ts)
       │
       ▼
Application / Presentation UI
```

### Why This Separation Exists
1. **Contract Stability**: Lumi API changes (e.g. renaming fields, nesting data) only require updating one mapper file.
2. **Type Safety**: Domain entities guarantee sanitized fields, non-null defaults, and domain helper methods.
3. **Decoupled Architecture**: Enables swapping out the RPC infrastructure with mock repositories or alternative transports without changing application code.

---

## 3. Package Version Pinning Rule

`package.json` pins `@lumi/contracts` and `@lumi/observability` to exact `npm:@lumi-devs/<pkg>@<version>`.
- **Never loosen to ranges**: Do not use `^` or `~`.
- **Incompatible Rejection**: `apps/api` validates contract versions at startup. Mismatched major/minor versions trigger immediate `CONTRACT_MISMATCH` fatal exceptions.
- **Upgrading**: When Lumi cuts a new contracts release, update `package.json` to the exact version, run `bun install`, and verify with `bun run typecheck`.
