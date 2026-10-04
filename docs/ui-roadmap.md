# UI/UX Roadmap

Plan to take `lumi-dashboard` from "solid admin panel" to a best-in-class Discord
bot dashboard. Written against the repo as of v0.6.0. Each phase is
independently shippable; each item has an acceptance check.

Legend: **S** ≤ 0.5 day · **M** 1–2 days · **L** 3–5 days

---

## Phase 0: Stabilize (do first)

| # | Item | Size | Done when |
|---|---|---|---|
| 0.1 | Restore light theme (`:root` = light, dark via media query + `[data-theme="dark"]`) | S | Toggling Light visibly changes the UI; System follows OS both ways |
| 0.2 | Pre-paint theme application (nonce'd inline script via `src/proxy.ts`, or cookie read in `layout.tsx`) | S | No wrong-theme flash on hard reload in either theme |
| 0.3 | Theme parity test: light and dark blocks define identical colour keys | S | `bun test` fails if a token exists in one theme only |
| 0.4 | Fix `--fg-subtle` contrast; align `themeColor` + `manifest.json` | S | All text tokens ≥ 4.5:1 on `--surface`/`--bg` in both themes |
| 0.5 | Sync `docs/design-system.md` to `DESIGN.md` (link, don't restate values) | S | No hex values duplicated outside `globals.css` and `DESIGN.md` |
| 0.6 | Duplicate-token cleanup: generate the dark block once (single selector list) | M | `globals.css` defines dark values in one place |

## Phase 1: Brand identity

| # | Item | Size | Done when |
|---|---|---|---|
| 1.1 | Export mascot as SVG; add `favicon`, `icon.svg`, `apple-touch-icon`, PWA icons (+ maskable), `og.png`; fill `manifest.icons` | M | Tab icon, installed PWA, and link previews show Lumi |
| 1.2 | Replace sparkle `Wordmark` with drop mark + LUMI wordmark | S | Sidebar, login, landing, error pages use it |
| 1.3 | `EmptyState` gets an optional `mascot` variant ("peeking" Lumi) | S | Used by `ModuleBoundary` disabled/not-installed, no-cases, no-appeals |
| 1.4 | Success + loading drop motion (stroke-draw check, drop fill) | M | Used after save and in setup wizard; honors reduced motion |
| 1.5 | Wave background (`.hero-atmosphere`) tuned per theme, paused when hidden | S | Header/hero only; ≤15% opacity light / ≤25% dark |
| 1.6 | Microcopy pass (friendly in empty/success, neutral in security/mod) | S | Tone rules in `DESIGN.md` §6 followed |

## Phase 2: Navigation and IA

| # | Item | Size | Done when |
|---|---|---|---|
| 2.1 | Regroup guild nav to **Overview / Protect / Community / Monitor / Settings** | M | No duplicate "Configuration" (top link + group); `guild-nav.ts` is still the single source for sidebar *and* palette |
| 2.2 | Unique icon per link (`SlidersHorizontal` is used twice) | S | Lint/test asserts icons unique within the nav |
| 2.3 | Move Voice Generators to Community; Logging config to Settings (linked from Monitor) | S | Matches user tasks, not route prefixes |
| 2.4 | Collapsed groups show alert dots for failing health / armed panic | S | Dot appears even when group is collapsed |
| 2.5 | Persistent panic-mode indicator in header | S | Visible on every guild page while armed, links to console |
| 2.6 | Breadcrumbs + "Back to Overview" consistency pass | S | Every page has a header with title and description |
| 2.7 | Sidebar collapses to icon rail on desktop; becomes drawer under `lg` | M | Works at 1280/1024/768/390 widths |

## Phase 3: Settings UX (highest daily-use value)

| # | Item | Size | Done when |
|---|---|---|---|
| 3.1 | Single sticky `SaveBar` per settings view (already exists; make it the *only* save affordance) | M | No per-card save buttons remain; shows "N unsaved changes" |
| 3.2 | Per-field dirty dot + "reset to default" | M | Field-level reset restores schema default |
| 3.3 | Unsaved-changes route guard (`beforeunload` + in-app) | S | Leaving with dirty state prompts |
| 3.4 | Inline validation with disabled-Save reason | M | Invalid field → message at field and reason on the bar |
| 3.5 | Role picker (searchable, role colors) alongside `channel-picker` | M | Colors match Discord; deleted roles show a fix action |
| 3.6 | Channel picker: category grouping + type icons + deleted-channel state | M | No silent failure on missing targets |
| 3.7 | Live `discord-message-preview` in light and dark Discord skins | M | Preview updates as you type; skin switch toggle |
| 3.8 | Settings history diff view ("what changed, by whom") | L | `config/history` shows before/after per field with revert |
| 3.9 | Toast provider with Undo for reversible actions | M | Unified feedback; used by blocklist, notes, thresholds |

## Phase 4: Command palette 2.0

| # | Item | Size | Done when |
|---|---|---|---|
| 4.1 | Index config fields from `configSchema` (label, description, section) | M | Typing "log channel" jumps to the field, scrolled and highlighted |
| 4.2 | Actions: create case, arm/disarm panic (via confirm), invite link, switch guild | M | Destructive actions route through confirm dialogs |
| 4.3 | Recent items + `/` to focus search, `?` shortcut sheet | S | Shortcut help lists `⌘K`, `⌘S`, `/`, `g o`, `g m`. |
| 4.4 | Mobile: palette as a full-height sheet | S | Usable one-handed |

## Phase 5: Data pages and tables

| # | Item | Size | Done when |
|---|---|---|---|
| 5.1 | Row → `Sheet` detail view (cases, appeals, audit) | M | Inspect without leaving the table |
| 5.2 | Saved filters + URL-synced filter state | M | Shareable links reproduce a view |
| 5.3 | Bulk actions with selection bar (reuses SaveBar's motion) | M | Select N → bar appears → confirm |
| 5.4 | Mobile: tables degrade to stacked cards | M | No horizontal scroll under `md` |
| 5.5 | Export (CSV/JSON) consistent via `export-log-button` | S | All data pages |
| 5.6 | Skeletons match final column/row dimensions | S | No layout shift on load (Lighthouse CLS < 0.02) |

## Phase 6: Overview and insight

| # | Item | Size | Done when |
|---|---|---|---|
| 6.1 | Stat strip with `stat-count-up` and sparkline deltas (7d) | M | Members, cases, active modules, latency |
| 6.2 | *Needs attention* ranks by severity, each with a one-click fix | M | Row action navigates to the exact field/page |
| 6.3 | First-run checklist driven by `setup-issues.ts` | M | Dismisses itself when complete; resumable |
| 6.4 | Activity charts: theme-aware, accessible (table fallback) | M | Colors from tokens; screen-reader summary |
| 6.5 | Shard/health view with live pills (`pulse-live`) | S | Only live signals pulse |

## Phase 7: Quality gates

| # | Item | Size | Done when |
|---|---|---|---|
| 7.1 | Wrap app in `<MotionConfig reducedMotion="user">` | S | New Motion components are safe by default |
| 7.2 | Visual regression (Playwright screenshots, light + dark, 3 breakpoints) | L | PRs show diffs for key pages |
| 7.3 | Automated a11y (axe) in Playwright; contrast assertions on tokens | M | CI fails on AA violations |
| 7.4 | Lighthouse CI budget (perf ≥ 90, CLS < 0.02) | S | Enforced on landing + overview |
| 7.5 | Storybook (or Ladle) for Tier-1/2 components in both themes | L | Contributors preview states without a live bot |

---

## Suggested sequencing

```
Week 1 Phase 0 + 1.1–1.3 (stability, identity visible everywhere)
Week 2 Phase 2 + 3.1–3.4 (nav + settings experience)
Week 3 Phase 3.5–3.9 + Phase 4 (pickers, preview, palette)
Week 4 Phase 5 + 6 (data pages, overview)
Ongoing Phase 7 (gates added as features land)
```

## Success metrics

- Light/dark parity: 0 token-set mismatches; screenshots reviewed in both.
- Accessibility: 0 axe AA violations on key pages; all text tokens ≥ 4.5:1.
- Perf/stability: CLS < 0.02 on overview/settings; no theme flash.
- Efficiency: time-to-find-a-setting (palette) under 5s; settings changes saved with 1 click/`⌘S`.
- Safety: no destructive action without confirm or undo.
