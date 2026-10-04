# DESIGN.md

Design system, UI guidelines, and component architecture for `lumi-dashboard`.

> **Source of truth:** token *values* live in `src/app/globals.css`. This file
> documents intent, rules, and patterns. If the two disagree, fix whichever is
> wrong in the same PR. `docs/design-system.md` and `docs/component-reference.md`
> must not restate token values; they link here.

---

## 1. Brand: "Midnight Sapphire", Lumi's water-drop

Lumi's identity is a glowing blue water-drop mascot on a near-black navy field,
with flowing luminous wave lines. The dashboard should feel like that logo: calm,
friendly, slightly luminous, and trustworthy for admin work.

**Personality:** calm · friendly · precise. Never loud, never corporate-cold.

| Principle | Rule |
|---|---|
| Calm by default | Motion and depth clarify state; they never decorate. |
| Semantic tokens only | No raw hex, no `white/40`-style alphas in components. |
| Light and dark are equal citizens | Both are first-class and tested. Neither is derived at runtime from the other. |
| Glow in dark, shadow in light | Glow disappears on light backgrounds. Use `--shadow-*` tinted blue in light, glow in dark. |
| Fewer layers | Hierarchy comes from restraint: one accent, one elevation language. |
| Friendly where it is safe to be | Personality (mascot, microcopy) lives in empty/success/loading states, never in destructive or security flows. |

### Mascot usage

- **Wordmark:** the drop mark + `LUMI` (Geist 600, `tracking-[0.06em]`, uppercase). The generic sparkle glyph is retired.
- **Allowed:** empty states, first-run/setup wizard, login, 404/error pages, success moments, loading of long operations.
- **Not allowed:** inside data tables, destructive dialogs, panic-mode console, audit log, or anywhere the user is making a high-stakes decision.
- **Placement:** "peeking over an edge" (as in the logo) for empty states; centered and small for success.
- **Assets** (required in `public/`): `favicon.ico`, `icon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` (+ maskable), `og.png` (1200×630). The mascot sits on a navy rounded badge in light theme so its glow still reads.

---

## 2. Tokens

Tokens are CSS custom properties in `src/app/globals.css`, exposed to Tailwind
through `@theme inline` (`bg-surface`, `text-fg-muted`, `border-border`, ...).

**Theme resolution** (implemented in `theme-provider.tsx`):

1. no `data-theme` → follow OS via `prefers-color-scheme`
2. `data-theme="light"` → force light (the `:root` base block)
3. `data-theme="dark"` → force dark

> **Invariant:** `:root` holds the **light** values. Dark values are applied by
> the `prefers-color-scheme` block and `:root[data-theme="dark"]`. Both blocks
> must define the *same set of keys*. CI should fail when they diverge
> (see roadmap, Phase 0).

### Surfaces, lines, text

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F4F8FF` | `#050816` | Page background |
| `--bg-subtle` | `#EAF1FF` | `#080D20` | Sidebar, inputs idle, wells |
| `--surface` | `#FFFFFF` | `#0B1124` | Cards, panels, popovers |
| `--surface-hover` | `#F0F5FF` | `#121A33` | Hover |
| `--surface-active` | `#E3ECFD` | `#192447` | Selected / pressed |
| `--border` | `#D5E2F7` | `#1C2644` | Default border |
| `--border-soft` | `#E4ECF9` | `#141C33` | Chrome edges (sidebar, rail) |
| `--border-strong` | `#B9CBEA` | `#2A375F` | Hover/emphasis |
| `--fg` | `#0B1124` | `#F2F6FF` | Primary text |
| `--fg-muted` | `#5A6785` | `#8A97B8` | Secondary text |
| `--fg-subtle` | `#66728F` | `#7683A6` | Hints, placeholders (see contrast rule) |
| `--fg-on-accent` | `#FFFFFF` | `#FFFFFF` | Text on accent fills |

### Accent and status

| Token | Light | Dark | Use |
|---|---|---|---|
| `--accent` | `#2F5BFF` | `#2F5BFF` | Primary fill, active route, focus |
| `--accent-hover` | `#264DE3` | `#264DE3` | Primary hover |
| `--accent-secondary` | `#0A8FE0` | `#3BB4FF` | Gradient end, charts, highlights |
| `--accent-fg` | `#2448D6` | `#60A5FA` | **Accent used as text/icons** (links) |
| `--accent-soft` | 9% accent | 15% accent | Tinted backgrounds |
| `--accent-glow` | `#BFE3FF` | `#9FD8FF` | Glow / halo color |
| `--success` / `--warning` / `--danger` | `#047857` / `#B45309` / `#DC2626` | `#34D399` / `#FBBF24` / `#F87171` | Status (+ `-soft` variants) |

### Contrast rules (WCAG 2.2 AA)

- Body text and any text smaller than 18px must reach **4.5:1**. UI icons and large text reach **3:1**.
- `--accent` is **not** a text color on surfaces (≈3.6:1 in dark). Use `--accent-fg`.
- `--fg-subtle` is for non-essential hints only. Anything the user must read uses `--fg-muted` or `--fg`.
- Verified ratios: `fg-muted/surface` 6.4:1 (dark), `accent-fg/surface` 7.4:1 (dark), white on `--accent` 5.2:1.
- Status is never color-only: pair with an icon and/or label.

### Gradient and glass

- **Brand gradient:** `linear-gradient(135deg, var(--accent), var(--accent-secondary))`. Use on primary buttons, progress, the active nav indicator, and focus-ring accents. Not on large surfaces.
- **Glass chrome** (`.glass`): nav, dropdowns, dialogs, sheets only. Falls back to solid under `prefers-reduced-transparency`.
- **Wave accent** (`.hero-atmosphere`): one slow blurred wave behind page headers / hero. ≤15% opacity in light, ≤25% in dark. Never behind dense data.

### Elevation

| Token | Role |
|---|---|
| `--shadow-sm` / `e1` | Subtle lift (inputs, chips) |
| `--shadow-md` / `e2` | Cards on hover, popovers |
| `--shadow-lg` / `e3` | Dialogs, sheets, save bar |
| `--shadow-accent` | Primary button, active nav pill |
| `--shadow-glow-accent` | Hover-elevated cards, live indicators |

Dark: glow-style. Light: soft blue-tinted drop shadows. Components never pick between them; they use the token.

### Typography

- **Display** (`--font-display`): Geist 500/600/700, headings, nav, buttons, labels, table headers.
- **Body** (`--font-sans`): OS system stack (San Francisco on Apple, zero bytes).
- **Mono** (`--font-mono`): JetBrains Mono, IDs, hashes, timestamps, counters. Use `.tabular` for numerals.
- Wordmark and small-caps labels use wide tracking (`0.06em` / `0.08em`). Headings are 600 with `0.01em`.

| Role | Size / weight |
|---|---|
| Page title | 28–32 / 600 |
| Section title | 20 / 600 |
| Card title | 16 / 600 |
| Body | 15 / 400, line-height 1.5 |
| Secondary / table | 14 / 400 |
| Caption / mono meta | 13 / 400 (never below 12) |

### Shape and spacing

- 4px base grid. Controls `--radius-control` (12px); panels `--radius-panel` (20px); pills `9999px`.
- Page gutter 24px (16px on mobile). Card padding 20–24px. Section gap 32px.

---

## 3. Motion

One easing, four durations, no overshoot. Defined in `globals.css`; spring presets in `src/lib/animate.ts`.

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | All CSS transitions |
| `--motion-instant` | 75ms | Tooltips |
| `--motion-fast` | 150ms | Hover, press, focus |
| `--motion-normal` | 300ms | Tabs, toggles, dropdowns |
| `--motion-slow` | 600ms | Page/section entrance |

### Where motion is used (and where it is not)

| Pattern | Implementation | Rule |
|---|---|---|
| Page entrance | `.rise` + `--rise-delay` (70ms beat) | Once per navigation; never on re-render |
| Lists/grids | `useStaggerIn` | Cap at ~8 items; `grid: true` for tile grids |
| Shared-element indicators | Motion `layoutId` (nav pill, tab underline, theme toggle) | Spring (`SpringSnappy`) |
| Save bar | Slides up from bottom (`SpringSoft`) | Appears only when dirty |
| Theme change | View Transitions circular reveal | Skipped under reduced motion |
| Live status | `.pulse-live` | **Only** for genuinely live signals (bot online, shard reporting) |
| Skeletons | `.skeleton` | Match final layout dimensions exactly (no CLS) |
| Success | Drop "fills", check draws via `stroke-dashoffset` | ≤600ms, once |
| Wave background | `lumi-atmosphere-drift` 20–30s | Pause when tab hidden |

**Forbidden:** bouncing/overshoot, looping decorative motion, motion on
destructive confirmations, parallax, animating layout properties other than via
`layoutId`/transform.

**Reduced motion is mandatory:** every animation honors
`prefers-reduced-motion` (CSS media query or Motion's `useReducedMotion`).
Prefer wrapping the app in `<MotionConfig reducedMotion="user">` so new
components are safe by default.

---

## 4. Information architecture

### Navigation model

Guild sidebar groups are task-oriented. Current → target:

| Group | Links |
|---|---|
| **Overview** (top) | Overview · Guided Setup |
| **Protect** | Moderation Cases · Warn Thresholds · Blocklist · Mod Notes · Appeals · Panic & Verification · Overrides |
| **Community** | Permits · Reaction Roles · Voice Generators |
| **Monitor** | Health · Activity & Trends · Audit Log · Logging |
| **Settings** (collapsed by default) | Modules · Addons · General · Advanced · Settings History |

Rules:

- Do **not** have a top-level link and a group with the same name (today: "Configuration" is both).
- Each link has a **unique icon** (today: `SlidersHorizontal` is used twice).
- A feature lives in the group matching the user's *task*, not the route prefix (Voice Generators is Community; Logging config is Settings, with a link from Monitor).
- Alert dots on a group header surface "needs attention" (panic armed, failing health check) so collapsed groups never hide problems.
- Guild nav and `CommandPalette` read from the same `guild-nav.ts`. A link added there must reach both.

### Command palette (`⌘K`)

Must search: nav links, guilds, **and config fields** (indexed from module
`configSchema`: "log channel", "anti-nuke limit"), recent cases/members, and
actions ("Arm panic mode", "Create case"). Results show a group label and
keyboard hint. Destructive actions in the palette always route to their
confirm dialog.

### Page templates

1. **Overview**: header (guild + live pill) → stat strip → *Needs attention* → health checks → recent audit. Never opens on a form.
2. **Settings page**: `PageHeader` → `SectionTabs` (from `sectionsOf`) → `ConfigGroupCard`s → sticky `SaveBar`. Max content width 960px.
3. **Data page** (cases, audit, appeals): `PageHeader` → `FilterBar` → `DataTable` (full width) → pagination. Rows open a `Sheet` for detail; no page navigation for quick inspection.
4. **Console page** (panic mode): high-contrast, minimal, deliberate friction. No mascot, no decoration.

Responsive: sidebar → drawer under `lg`; tables degrade to stacked cards under `md`; touch targets ≥ 40px.

---

## 5. Component architecture

UI code is divided into four tiers:

```
src/
├── components/
│   ├── ui/         # Tier 1: domain-agnostic primitives
│   ├── config/     # Tier 2: schema-driven configuration controls
│   └── layout/     # Tier 3: app scaffolding, nav, ModuleBoundary
└── modules/
    └── <name>/components/   # Tier 4: feature-specific widgets
```

- **Tier 1** (`ui/`): Radix + Tailwind v4 primitives (`button`, `card`, `data-table`, `sheet`, `empty-state`, `status-pill`, ...; skeleton shells in `components/skeletons.tsx`). No bot/domain knowledge. Icons: `lucide-react` only; never emoji as iconography (emoji appear only as author-provided module metadata via `Glyph`).
- **Tier 2** (`config/`): `config-field-input`, `config-group-card`, `channel-picker` (a `role-picker` is planned, see roadmap), `discord-message-preview`, `message-builder-v2`.
- **Tier 3** (`layout/`): `side-nav`, `guild-side-nav`, `site-header`, `breadcrumbs`, `command-palette`, `ModuleBoundary`.
- **Tier 4** (`modules/<name>/components/`): moderation cases, anti-nuke card, panic console, tempvc generators, verification panel, etc.

Module boundaries and import rules are enforced by ESLint; see `AGENTS.md` §2.

### Button hierarchy

| Variant | Use |
|---|---|
| `primary` | One committing action per view. Brand gradient + `--shadow-accent` |
| `secondary` | Default |
| `ghost` | Toolbars, repeated inline actions |
| `danger` | Irreversible, already-confirmed actions |
| `dangerGhost` | Destructive, low emphasis (Remove, Uninstall) |
| `link` | Inline text action |

### Discord-faithful previews

`discord-message-preview` uses the `--discord-*` palette (Discord's own colors,
not Lumi's) so previews match the client. It follows the dashboard theme
resolution, so a preview never sits as a dark slab on a light page. Blurple is
theme-independent by design.

---

## 6. Interaction patterns

### Save bar (settings)

- One **sticky** `SaveBar` per settings view, not per-card save buttons.
- Appears on first dirty field; shows count ("3 unsaved changes"), **Discard** and **Save**; `⌘S`/`Ctrl+S` saves.
- Dirty fields get a small accent dot and a per-field *reset to default*.
- Navigating away with unsaved changes prompts (`beforeunload` + in-app route guard).
- Saving state disables fields; success flashes the drop-check, not a toast.
- Validation is inline and immediate; the bar's Save is disabled with a reason when invalid.

### `<ModuleBoundary>` states

| State | Presentation |
|---|---|
| Loading | Skeletons with final-layout dimensions |
| Disabled / not installed | **Empty state with mascot** + one primary "Enable module" button |
| Unauthorized | Names the missing capability and who can grant it |
| Error | Error code (mono), **Retry**, **Copy details** |
| Available | Children |

### Destructive actions

- Reversible → do it, show an **Undo** toast (≈8s).
- Irreversible → `ConfirmDialog`; for high-impact (ban all, wipe config) require **typing the target name**.
- Danger zones: red-tinted card (`--danger-soft`), grouped at the bottom, labelled.
- Panic mode: distinct high-contrast console, explicit arm/disarm, state always visible in the header (not only on its page).

### Pickers

- Channel and role pickers (role picker: planned): searchable, grouped by category, type icons for channels, roles rendered in their real Discord color, invalid/deleted targets shown as "Deleted channel" with a fix action rather than failing silently.

### Feedback and microcopy

- Voice: friendly, concrete, short. "Lumi is checking permissions…", "All set.", "Couldn't reach Lumi. Retry?".
- No exclamation marks in errors. No jokes in security, moderation, or appeals flows.
- Toasts *(not yet implemented; add a Radix/sonner-style provider, see roadmap)*: bottom-right, ≤1 line + optional action, auto-dismiss 5s (8s with Undo).

---

## 7. Accessibility

- WCAG 2.2 AA throughout; see contrast rules in §2.
- Visible focus ring (`--ring`, 2px + offset) on every interactive element; never `outline: none` without replacement.
- All Radix primitives retain their keyboard model; custom widgets (palette, pickers, data-table) must too.
- Status never conveyed by color alone.
- `prefers-reduced-motion` and `prefers-reduced-transparency` respected (see §3, §2).
- Live regions for async results (save success/failure, bulk actions).
- Tables: real `<table>` semantics, sortable headers announce state.

---

## 8. Platform notes

- **Dark Reader lock:** root layout sets `darkreader-lock="1"` to prevent extensions from rewriting colors before hydration. Keep it.
- **Theme flash:** the stored theme must be applied **before first paint**. The provider reads `localStorage` in an effect, which is too late. Apply via an early inline script (use the per-request CSP nonce from `src/proxy.ts`) or persist the choice in a cookie read on the server in `layout.tsx`.
- **Meta colors:** `viewport.themeColor` and `manifest.json` use `#F4F8FF` (light) and `#050816` (dark). Update them whenever `--bg` changes.
- **Fonts** are self-hosted via `next/font`; do not add third-party font origins (CSP).

---

## 9. Schema-driven pages

Settings pages MUST derive their structure from the module `configSchema` in `@lumi/contracts`:

1. `sectionsOf(module.configFields)` → sections/groups in declaration order.
2. `SectionTabs` for navigation.
3. `ConfigGroupCard` per group.
4. Bespoke cards (e.g. `AntiNukeCard`) only when a generic field stack demonstrably fails the UX.

The same schema feeds command-palette search and per-field "dirty" tracking.

---

## 10. Contribution checklist (UI PRs)

- [ ] Uses tokens only; no raw hex or alpha-white hacks.
- [ ] Checked in **light and dark** (screenshot both for visual changes).
- [ ] Contrast meets §2; status not color-only.
- [ ] Keyboard-operable; focus visible.
- [ ] Respects reduced motion; no new looping animation.
- [ ] Loading state uses a layout-matching skeleton.
- [ ] Empty/error states use `EmptyState` / `ModuleBoundary`.
- [ ] No emoji icons; lucide only; unique icon per nav item.
- [ ] `bun run typecheck`, `bun run lint`, `bun test` pass.
- [ ] If tokens changed: `DESIGN.md` updated in the same PR.
