# Lumi Dashboard Agent Documentation

Comprehensive, source-grounded reference manual for AI agents operating in `lumi-dashboard`.

`AGENTS.md` at the repository root is the top-level operating spec. This directory provides deep architectural reference, convention documentation, and step-by-step implementation workflows.

---

## Directory Layout

### 1. `architecture/`
- [`layered-architecture.md`](architecture/layered-architecture.md): Full breakdown of `domain/` $\rightarrow$ `ports/` $\leftarrow$ `infrastructure/`, `application/`, and `modules/`.
- [`module-contract.md`](architecture/module-contract.md): The `DashboardModule` contract, dynamic registry, capability discovery, and automated navigation.
- [`rpc-bridge-and-dtos.md`](architecture/rpc-bridge-and-dtos.md): Internal HTTP RPC bridge transport, wire DTOs vs domain models, and `@lumi-devs/contracts` version pinning rules.

### 2. `conventions/`
- [`component-organization.md`](conventions/component-organization.md): Visual tiers (`components/ui`, `components/config`, `components/layout`) vs domain-owned module components.
- [`data-fetching-and-cache.md`](conventions/data-fetching-and-cache.md): TanStack Query integration, cache keys, mutations, and optimistic updates.
- [`error-handling.md`](conventions/error-handling.md): `AppError` hierarchy, error boundaries, action results, and the `<ModuleBoundary>` lifecycle.
- [`testing-patterns.md`](conventions/testing-patterns.md): HappyDOM setup, TanStack Query test wrappers, and mocking server actions / application use cases.

### 3. `workflows/`
- [`adding-a-module.md`](workflows/adding-a-module.md): Step-by-step recipe to add a new feature domain (e.g. `starboard`) with zero plumbing overhead.
- [`adding-a-use-case.md`](workflows/adding-a-use-case.md): How to create an application use case, register a port method, and wire the RPC adapter.
- [`schema-migrations.md`](workflows/schema-migrations.md): Client-side schema version migrations using `MigrationRunner`.

---

## Golden Rules
1. **Never bypass `src/application/` or ports**: UI components must not import `src/infrastructure/` directly.
2. **Never import React/Next inside `domain/` or `ports/`**: The domain and ports layers must remain 100% framework-agnostic.
3. **No cross-module internal imports**: Modules may only export their public API through `index.ts`.
4. **All checks must pass green**: Run `bun run typecheck`, `bun test`, and `bun run lint` before finishing any task.
