# lumi-dashboard

The **Lumi Dashboard** is a Next.js (App Router) web administration panel for
[Lumi](https://github.com/lumi-devs/Lumi), a self-hosted, modular Discord bot. It lets Discord
server administrators manage Lumi's modules and configuration from a browser instead of Discord
chat commands.

This dashboard **never touches Postgres or Redis directly and never holds the Discord bot
token**. Every read/write is proxied over an internal HTTP RPC bridge to Lumi's `apps/api`
process (`src/lib/rpc.ts`, a `server-only` module reachable only from Server Components / Route
Handlers / Server Actions), authenticated with a shared `RPC_INTERNAL_TOKEN`.

This repo was split out of the main [`lumi-devs/Lumi`](https://github.com/lumi-devs/Lumi)
monorepo (`apps/dashboard`), with history preserved via `git subtree split`. It depends on two
packages published from that monorepo to GitHub Packages: `@lumi-devs/contracts` and
`@lumi-devs/observability` (aliased in `package.json` back to their in-repo names, `@lumi/contracts`
and `@lumi/observability`, so none of the source's import specifiers had to change).

## Overview

- **Auth**: Discord OAuth2 via [NextAuth.js (Auth.js v5)](https://authjs.dev). Session is a JWT
  (`DASHBOARD_SESSION_SECRET`); `session.isBotOwner` comes from the api's `auth.whoami` RPC call.
- **RPC bridge**: `src/lib/rpc.ts` POSTs to `RPC_HTTP_URL`, Lumi's `apps/api` internal RPC HTTP
  server, over the deployment's private network.
- **IDOR guard**: `src/lib/auth-guards.ts`'s `authorizedGuild()` is re-checked on every
  guild-scoped page render and Server Action.
- **Settings pages derive from schema**: a settings page never hand-lists a module's fields,
  groups, or tabs — it calls `sectionsOf()` (from `@lumi/contracts`, backed by the module's own
  `configSchema` on the Lumi side) and renders the result with `SectionTabs` + `ConfigGroupCard`.
  A field added to a module in Lumi appears on the dashboard automatically; no dashboard change
  needed.

## Contract-version compatibility

Lumi's `apps/api` validates the dashboard's `@lumi/contracts` build against its own at connect
time and rejects an incompatible one with `CONTRACT_MISMATCH`. The pin in `package.json`
(`"@lumi/contracts": "npm:@lumi-devs/contracts@<version>"`, same for `@lumi/observability`) must
match (or be within the compatible range of) whatever Lumi has deployed. When Lumi cuts a new
`contracts`/`observability` release, bump both pins here, run `bun install`, and redeploy.

## Required environment

| Variable | Required | Default | Description |
|---|:---:|:---:|---|
| `DASHBOARD_HOST` | No | `0.0.0.0` | Interface to bind. |
| `DASHBOARD_PORT` | No | `8080` | Port to listen on. |
| `DASHBOARD_SESSION_SECRET` | **Yes** | - | NextAuth's session JWT encryption secret. Generate with `openssl rand -hex 32`. |
| `DISCORD_OAUTH2_CLIENT_ID` | **Yes** | - | Discord Application Client ID. |
| `DISCORD_OAUTH2_CLIENT_SECRET` | **Yes** | - | Discord Application Client Secret. |
| `RPC_HTTP_URL` | **Yes** | - | Base URL of Lumi's `apps/api` internal RPC HTTP server, e.g. `http://api:8091`. |
| `RPC_INTERNAL_TOKEN` | **Yes** in production | - | Shared secret authenticating dashboard -> apps/api RPC. Must match the value `apps/api` is configured with. |
| `METRICS_ENABLED` | No | `true` | Enables the `/healthz`, `/readyz`, `/metrics` telemetry server. |
| `METRICS_PORT` | No | `9090` | Port for the telemetry server. |
| `AUTH_URL` | No | derived from request | Set when behind a reverse proxy that rewrites the Host header. |
| `DASHBOARD_PUBLIC_URL` | No | - | Public origin, used to build appeal-DM links and the post-invite return URL. |

The OAuth2 redirect URI is not an env var — NextAuth derives it from the request. Register
`<dashboard-origin>/api/auth/callback/discord` under **OAuth2 -> Redirects** on your Discord
application.

## Local development

```bash
bun install
bun run dev
```

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

## Docker

```bash
docker buildx build --target dashboard -t lumi-dashboard .
```

## Repository secrets

| Secret | Scope | Used by |
| :--- | :--- | :--- |
| `DEPENDABOT_TOKEN` | Dependabot | Classic PAT with only `read:packages`. Dependabot does not receive `GITHUB_TOKEN`, and GitHub Packages' npm registry requires auth even for public packages, so without it every npm update run fails to resolve `@lumi-devs/*`. Rotate it before the PAT expires. |

CI and the Docker workflow need no extra secrets: they authenticate to GitHub Packages with
the workflow's own `GITHUB_TOKEN`, which works because this repository has read access on the
`contracts`/`observability` packages and write access on the `lumi-dashboard` image package
(each package's **Manage Actions access** setting).

## License

GPL-3.0-only, matching the main [Lumi](https://github.com/lumi-devs/Lumi) repository.
