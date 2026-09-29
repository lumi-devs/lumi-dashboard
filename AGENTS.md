# AGENTS.md

Operating spec for any AI coding agent working in this repository.

`lumi-dashboard` is the standalone Next.js (App Router) web admin panel for
[Lumi](https://github.com/lumi-devs/Lumi), a self-hosted, modular Discord bot. It was split out
of the Lumi monorepo (`apps/dashboard`) so it can be built and deployed independently. See
`README.md` for environment variables, local dev, and the contract-version compatibility rule.

## Architecture invariant

This app never opens a Postgres or Redis connection and never holds the Discord bot token. Every
read/write is proxied over an internal HTTP RPC bridge to Lumi's `apps/api` process. The only
allowed way to reach the bridge is `src/lib/rpc.ts` (a `server-only` module) — a page, component,
or Server Action must never call `fetch()` against `RPC_HTTP_URL` directly, and must never import
Prisma/`pg`/`ioredis` at all.

- Reads: `src/lib/guild-reads.ts`, deduped per-request with React's `cache()`.
- Mutations: `src/actions/*.ts`, one file per domain (guild, moderation, security, tempvc,
  overrides, history, blocklist, advanced, system, user, auth) — Server Actions only, never a
  client-side POST to the bridge.
- `src/lib/auth-guards.ts`'s `authorizedGuild()` must be re-checked on every guild-scoped page
  render and every guild-scoped Server Action — it is the IDOR guard and must never be trusted
  from client-sent state (route params, form fields, etc.) without that check.

## Settings pages derive from schema

A settings page must never hand-list a module's fields, groups, or tabs. It derives them from
`sectionsOf()` (imported from `@lumi/contracts`, which is backed by the module's `configSchema`
on the Lumi side) and renders the result with `SectionTabs` + `ConfigGroupCard`. See
`src/app/guild/[guildId]/security/page.tsx` or
`src/app/guild/[guildId]/config/modules/logging/page.tsx` for the working pattern. Where a
non-schema widget has to be placed by hand (a console, a record list), keep the field/action name
it matches easy to grep, since nothing here enforces that match automatically the way the
monorepo's own test suite does against Lumi's core source.

## Discord embeds / UI conventions

- Never construct `new EmbedBuilder()` — this app doesn't send Discord messages directly; any
  "send a test message" action goes through an RPC call to Lumi, which owns Components-v2 card
  rendering.
- Icons: `lucide-react` only. Emoji are never used as an icon set; a module's own `emoji` field is
  author-supplied metadata rendered via `components/ui/glyph.tsx`.
- Design tokens live in `src/app/globals.css` as CSS custom properties (`--surface`, `--fg-muted`,
  `--accent`, ...). Components consume those tokens, never a raw color or an alpha-blended
  Tailwind color, or light mode breaks.

## Contract-version pin

`package.json` pins `@lumi/contracts` and `@lumi/observability` to exact
`npm:@lumi-devs/<pkg>@<version>` specifiers. Lumi's `apps/api` rejects an incompatible dashboard
build with `CONTRACT_MISMATCH` at RPC-connect time. Never loosen these to a range — bump the exact
version pin (and re-run `bun install`) when Lumi cuts a new `contracts`/`observability` release,
and check Lumi's own changelog for breaking RPC/view-shape changes before bumping.

## Running things

- `bun install` — needs `NODE_AUTH_TOKEN` (a GitHub PAT with `read:packages`, or
  `secrets.GITHUB_TOKEN` in Actions) in the environment; `.npmrc` reads it to authenticate against
  `npm.pkg.github.com` for the `@lumi-devs` scope.
- `bun run typecheck` — `tsc --noEmit -p tsconfig.json`.
- `bun run lint` — `eslint src` (plain ESLint, not `next lint`, which Next 16 removed).
- `bun run test` — `bun test --parallel`.
- `bun run build` — `next build` (standalone output).

## Testing conventions

Tests live under `tests/`, mirroring `src/`. `tests/happydom-register.ts` and `tests/setup.ts` are
both required as `bunfig.toml` preloads, in that order (`happydom-register.ts` must finish
registering the DOM globals before `setup.ts`'s static imports, including
`@testing-library/react`, resolve). `tests/setup.ts` also owns the process-wide `bun:test`
`mock.module()` registrations for `server-only`, `#/actions/guild-actions`, `next/navigation`, and
`#/lib/auth` — add new shared mocks there rather than declaring a competing per-file mock, since
`mock.module()` replaces a module's exports globally and the last registration wins.
