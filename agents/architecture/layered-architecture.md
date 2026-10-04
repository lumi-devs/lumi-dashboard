# Layered Architecture

`lumi-dashboard` implements an inversion-of-control (ports & adapters) domain-driven architecture.
The UI and external RPC transport are decoupled by abstract boundaries.

---

## 1. Dependency Flow

The application enforces a unidirectional dependency hierarchy:

```text
               src/app/ (Next.js App Router)
                  │
                  ▼
              src/modules/ (Domain feature modules)
                  │
                  ▼
             src/application/ (Use cases)
                  │
                  ▼
               src/domain/ (Pure entities & business logic)
                  │
                  ▼
               src/ports/ (Abstract repository & service interfaces)
                  ▲
                  │
          src/infrastructure/ (RPC clients, DTO mappers, adapters)
```

**Mechanical Enforcement**:
`eslint.config.mjs` enforces this dependency graph using `@typescript-eslint/no-restricted-imports`. Any import that violates the flow (e.g. `src/domain` importing React, or `src/modules` importing `src/infrastructure`) triggers a build-blocking lint error.

---

## 2. Layer Responsibilities

### `src/app/` (Edge Presentation)
Next.js App Router layer:
- Route segment configuration (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`).
- Performs server-side authentication (`authorizedGuild()`) and fetches initial state via `src/application/`.
- Composes server components and hands data to domain module views.

### `src/modules/` (Feature Packages)
Isolated domain modules (`moderation`, `security`, `tempvc`, `verification`, `reaction-roles`, `afk`, `appeals`, `overview`, `setup`, `guild-config`):
- Each module has a formal declaration (`definition.ts`), public export barrel (`index.ts`), and internal components (`components/`).
- Modules consume domain use cases and hooks.
- Modules never import internal files from sibling modules.

### `src/application/` (Use Cases)
Application orchestration layer:
- Encapsulates discrete system operations (e.g. `GetGuildOverview`, `GetModuleConfig`, `UpdateModuleConfig`, `ToggleModule`, `GetRecentAuditLogs`).
- Implemented as classes with `.execute()` methods and pure input parameters.
- Receives abstract ports via constructor dependency injection.
- Re-exports an application container (`getApplication()`) and typed runner functions.

### `src/domain/` (Core Business Rules)
Framework-independent domain core:
- **Entities & Value Objects**: `Guild`, `GuildRole`, `GuildChannel`, `Viewer`, `Module`, `Capability`.
- **Authorization**: Pure capability evaluation policies (`src/core/authorization/policies/`).
- **Migrations**: Stored schema upgrades (`src/domain/modules/migrations/`).
- Banned from importing React, Next.js, or external infrastructure drivers.

### `src/ports/` (Boundary Interfaces)
Abstract interfaces defining data and capability requirements:
- `GuildPort.ts`: Read guild details, overview, roles, channels.
- `ModulePort.ts`: Read/write module configurations and toggles.
- `PermissionPort.ts`: Fetch user capabilities and permit assignments.
- `AuditPort.ts`: Read guild audit logs and activity events.

### `src/infrastructure/` (Adapters & External Drivers)
Concrete implementation of ports:
- `mappers/`: Translates wire DTOs (`@lumi/contracts`) into pure domain models.
- `repositories/`: Implements port interfaces by calling Lumi's HTTP RPC bridge (`RpcGuildRepository`, `RpcModuleRepository`, etc.).
- `index.ts`: Central service container (`getGuildPort()`, `getModulePort()`, etc.).
