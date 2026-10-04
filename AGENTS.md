# AGENTS.md

Operating specification for AI coding agents working in `lumi-dashboard`.

`lumi-dashboard` is the standalone Next.js (App Router) web admin dashboard for
[Lumi](https://github.com/lumi-devs/Lumi), a self-hosted, modular Discord bot.
It communicates exclusively with Lumi's `apps/api` process over an internal HTTP RPC bridge.

For deep-dive architectural references, conventions, and step-by-step recipes, consult [`agents/`](agents/README.md).
For design systems, tokens, and component UI rules, consult [`DESIGN.md`](DESIGN.md).

---

## 1. System Invariants & Trust Boundaries

1. **Zero Database / Redis / Gateway Connections**:
   This application never imports `pg`, `ioredis`, `@prisma/client`, or `discord.js` gateway clients. It holds no bot token.
   All data reads, mutations, and actions route over the typed HTTP RPC bridge via `src/lib/rpc.ts`.
2. **Server-Only Bridge**:
   `src/lib/rpc.ts` is guarded with `import "server-only"`. The client browser never communicates directly with Lumi's RPC port.
3. **Authorization & IDOR Defense**:
   All guild-scoped routes and Server Actions MUST authenticate the user and verify guild management rights via `authorizedGuild()` or capability checks in `src/core/authorization/`. Never trust guild IDs passed directly from client components.
4. **Strict Pinning of `@lumi-devs/contracts`**:
   `package.json` pins `@lumi/contracts` and `@lumi/observability` to exact `npm:@lumi-devs/<pkg>@<version>`. Never loosen these to semver ranges (`^` or `~`). Mismatched versions will trigger `CONTRACT_MISMATCH` rejection at RPC-connect time.

---

## 2. Layered Architecture & Dependency Rules

The dashboard follows a strict, domain-driven, module-agnostic architecture:

```text
                  app/ (Next.js App Router: routing & layout only)
                   │
                   ▼
               modules/ (Feature domains: moderation, security, etc.)
                   │
                   ▼
              application/ (Use cases: GetGuildOverview, UpdateConfig)
                   │
                   ▼
                 domain/ (Pure entities, capabilities, policies)
                   │
                   ▼
                 ports/ (Abstract interfaces: GuildPort, ModulePort)
                   ▲
                   │
            infrastructure/ (RPC repositories & DTO mappers)
```

### Architectural Boundaries (Enforced by ESLint)
- **`src/domain/`**: Pure business models and policies. Banned from importing React, Next.js, or `src/infrastructure/`.
- **`src/ports/`**: Input/output boundary interfaces. Banned from importing `src/infrastructure/` or Next.js.
- **`src/modules/`**: Feature slices (`src/modules/<name>/`).
  - Must expose a public API through `index.ts`.
  - Must never import internals from a sibling module (e.g. `src/modules/moderation` cannot import `src/modules/security/internal`).
  - Banned from importing directly from `src/infrastructure/` (routes through `application/` or module hooks).
- **`src/components/`**:
  - `src/components/ui/`: Generic design system components (Radix primitives, Tailwind v4).
  - `src/components/config/`: Schema-driven form and configuration widgets.
  - `src/components/layout/`: Shared layout scaffolding and the `<ModuleBoundary>` component.

---

## 3. Data Fetching & Cache Management

- **Client State & Caching**: Powered by `@tanstack/react-query` via `<QueryProvider>` in `src/app/layout.tsx`.
- **Module Hooks**:
  - `useModuleConfig(guildId, moduleName)`: Reads module settings with built-in caching, background refetch, and loading states.
  - `useUpdateModuleConfig({ guildId, moduleName })`: Mutation hook with automatic query cache invalidation and error propagation.
- **Server Actions**:
  - Located in `src/actions/*.ts`.
  - Server actions MUST delegate orchestration to `src/application/` use cases rather than calling raw transport RPC directly.

---

## 4. UI, Design Tokens & Schemas

- **Icons**: `lucide-react` ONLY. Never use emojis as iconography; emojis are reserved for author-provided module metadata rendered with `Glyph`.
- **Styling**: Tailwind CSS v4 and CSS custom properties in `src/app/globals.css` (`--surface`, `--fg-muted`, `--accent`).
- **Schema-Driven Rendering**: Settings panels derive dynamically from `@lumi/contracts` `sectionsOf()` using `SectionTabs` and `ConfigGroupCard`. Never hardcode config fields that exist in Lumi's schema.
- **State Handling**: Wrap module pages or sections with `<ModuleBoundary>` to handle `Loading`, `Disabled / Not Installed`, `Permission Denied`, and `Error` states uniformly.

---

## 5. Development & Verification Commands

Development and test tools run through Bun within the workspace Nix environment:

- `bun run typecheck` — Runs `tsc --noEmit -p tsconfig.json` with strict type checking.
- `bun run lint` — Runs ESLint checking code style and architectural import boundaries.
- `bun test` — Runs the full test suite (`bun test --parallel`) using HappyDOM.
- `bun run build` — Builds the production Next.js standalone application bundle.

Before completing any task, always ensure `typecheck`, `test`, and `lint` pass green.
