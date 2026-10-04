# Component Organization

Visual components in `lumi-dashboard` follow strict boundaries to prevent the creation of bloated "junk-drawer" component directories.

---

## 1. Directory Breakdown

| Directory | Scope | Dependencies | Examples |
|---|---|---|---|
| `src/components/ui/` | Truly generic, reusable design system primitives | Radix UI, Tailwind v4, Lucide icons. NO domain or bot concepts. | `Button`, `Input`, `Dialog`, `Select`, `DataTable`, `Tabs` |
| `src/components/config/` | Schema-driven form and config controls | Generic schema definitions, `@lumi/contracts` fields | `ConfigFieldInput`, `ConfigGroupCard`, `ChannelPicker`, `RolePicker` |
| `src/components/layout/` | Scaffolding, navigation, and status wrappers | Next.js layout, header, sidebar, `ModuleBoundary` | `Sidebar`, `Header`, `ModuleBoundary`, `GuildPicker` |
| `src/modules/<name>/components/` | Domain-owned feature components | Domain models, module hooks, use cases | `ModerationCasesTable`, `AntiNukeCard`, `TempVcGenerators` |

---

## 2. Decision Matrix: Where Does a Component Belong?

- **Q: Does this component represent a generic HTML control (button, input, modal)?**
  $\rightarrow$ Put in `src/components/ui/`.
- **Q: Does this component read an abstract `ConfigField` schema and render an appropriate input control?**
  $\rightarrow$ Put in `src/components/config/`.
- **Q: Does this component wrap a page in a loading, permission, or error state?**
  $\rightarrow$ Put in `src/components/layout/`.
- **Q: Does this component render feature-specific moderation cases, panic consoles, or verification panels?**
  $\rightarrow$ Put in `src/modules/<feature>/components/`.

---

## 3. Strict Rules
- **No `src/components/guild/`**: The legacy directory has been purged. Never re-introduce it.
- **Single Public API**: Other modules or routes must import module components through `src/modules/<name>/index.ts` rather than reaching deep into `src/modules/<name>/components/foo.tsx`.
- **No Emojis as Icons**: Use `lucide-react` icons. User-configured module emojis are rendered strictly via `src/components/ui/glyph.tsx`.
