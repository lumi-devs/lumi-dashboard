# DESIGN.md

Design system, UI guidelines, and component architecture for `lumi-dashboard`.

---

## 1. Design Principles & Theme Tokens

`lumi-dashboard` is built on a dark-tech, utilitarian, responsive aesthetic tailored for large-scale Discord bot administration.

### Color Tokens & Variables
Tokens are defined in `src/app/globals.css` using CSS custom properties. Components MUST consume these tokens rather than raw hex codes or arbitary tailwind color classes, ensuring consistent contrast and theme preservation:

- `--surface`: Base surface color for cards, panels, and sidebars (`#10121a` dark / `#ffffff` light).
- `--surface-subtle`: Subtle elevation layer for secondary items and hover states.
- `--surface-raised`: Popovers, dropdown menus, and modal dialogs.
- `--border`: Standard panel and divider border color.
- `--fg`: Primary text and foreground icon color.
- `--fg-muted`: Secondary descriptions, timestamps, and subtle hints.
- `--accent`: Brand primary accent used for active tabs, primary buttons, and focus rings.
- `--destructive`: Danger alerts, ban confirmations, and destructive actions.

### Dark Mode & Dark Reader Lock
The dashboard defaults to dark mode with full dark/light system adaptation.
To prevent third-party extensions (like Dark Reader) from manipulating colors post-render and triggering hydration mismatches, the root `layout.tsx` enforces `darkreader-lock="1"`.

### Typography
- **Headings & Navigation**: Geist (`--font-geist`).
- **Body Text**: Native system UI sans font stack (`--font-sans`).
- **Monospace (IDs, Hashes, Timestamps, Metrics)**: JetBrains Mono (`--font-jetbrains`).

---

## 2. Component Taxonomy & Boundaries

UI code is strictly divided into four distinct tiers:

```text
src/
├── components/
│   ├── ui/         # Tier 1: Generic, domain-agnostic UI primitives
│   ├── config/     # Tier 2: Schema-driven configuration controls
│   └── layout/     # Tier 3: Application scaffolding & status boundaries
└── modules/
    └── <name>/
        └── components/ # Tier 4: Feature-specific interactive widgets
```

### Tier 1: Generic Design System (`src/components/ui/`)
Contains dumb visual primitives with no bot or domain knowledge:
- Buttons (`button.tsx`), Badges (`badge.tsx`), Inputs (`input.tsx`), Select (`select.tsx`), Dropdowns (`dropdown-menu.tsx`), Dialogs (`dialog.tsx`), Tabs (`tabs.tsx`), Data Tables (`data-table.tsx`), Skeleton loaders (`skeleton.tsx`).
- Built using **Radix UI** primitives and **Tailwind CSS v4**.
- **Icon Policy**: `lucide-react` only. Do not use emoji as icons.

### Tier 2: Configuration Controls (`src/components/config/`)
Dynamic controls generated from module configuration schemas:
- `config-field-input.tsx`: Semantic input renderer based on field types (`string`, `number`, `boolean`, `enum`, `channel`, `role`, `duration`).
- `config-group-card.tsx`: Renders a grouping of fields with change tracking and validation indicators.
- `channel-picker.tsx` / `role-picker.tsx`: Discord entity selectors populated by domain models.
- `discord-message-preview.tsx`: Visual previewer for Discord messages and card embeds.

### Tier 3: Layout & Lifecycle Scaffolding (`src/components/layout/`)
- `sidebar.tsx`, `header.tsx`, `guild-picker.tsx`: Layout navigation structures.
- `ModuleBoundary.tsx`: The standard lifecycle boundary component.

### Tier 4: Module-Specific Components (`src/modules/<name>/components/`)
Components tightly coupled to a single feature domain:
- `src/modules/moderation/components/`: Case table, mod notes, warn threshold ladder.
- `src/modules/security/components/`: Anti-nuke limits grid, panic mode console, overrides board.
- `src/modules/tempvc/components/`: Generator creator, live channel list.
- `src/modules/verification/components/`: Verification panel card and rule preview.

---

## 3. The `<ModuleBoundary>` Lifecycle Pattern

Every module settings page or major feature tab should be wrapped in `<ModuleBoundary>` to eliminate boilerplate checks:

```tsx
<ModuleBoundary
  moduleId="moderation"
  capability="moderation.view"
  isLoading={isLoading}
  error={error}
>
  <ModerationContent />
</ModuleBoundary>
```

### Lifecycle Progression
1. **Loading**: Renders skeleton placeholders without layout shifting.
2. **Disabled / Not Installed**: Displays an alert prompting the guild admin to enable the module.
3. **Unauthorized**: Displays permission denial when the user lacks the required capability.
4. **Error**: Displays an error card with error code and an optional retry callback.
5. **Available**: Renders children once all checks pass.

---

## 4. Schema-Driven Page Derivation

Settings pages MUST derive their structure dynamically from the module's `configSchema` defined in `@lumi/contracts`:
1. Use `sectionsOf(module.configFields)` to compute declared sections and groups in declaration order.
2. Render tabbed navigation using `SectionTabs`.
3. Pass grouped fields to `ConfigGroupCard`.
4. Only create bespoke cards (e.g. `AntiNukeCard`) when a generic field stack fails user experience needs.
