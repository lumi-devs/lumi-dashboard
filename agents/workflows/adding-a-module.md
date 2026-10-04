# Adding a Module to the Dashboard

Follow this step-by-step checklist to introduce a new domain feature module (e.g. `starboard`, `economy`) into `lumi-dashboard`.

---

## Step 1: Create the Module Package

Create the module directory under `src/modules/<module-name>/`:

```text
src/modules/starboard/
├── definition.ts
├── index.ts
└── components/
    ├── starboard-settings.tsx
    └── starboard-board.tsx
```

---

## Step 2: Define the Module Contract (`definition.ts`)

```ts
// src/modules/starboard/definition.ts
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const starboardModule = defineDashboardModule({
  id: "starboard",
  name: "Starboard",
  description: "Highlight popular messages voted by your server community",
  icon: "Star",
  category: "engagement",
  capabilities: ["starboard.view", "starboard.manage"],
  configurationKey: "starboard",
  navigation: [
    {
      title: "Starboard",
      href: "/starboard",
      icon: "Star",
      section: "Server Tools",
      requiredCapabilities: ["starboard.view"],
    },
  ],
});
```

---

## Step 3: Export Public API (`index.ts`)

```ts
// src/modules/starboard/index.ts
export * from "./definition";
export { StarboardSettings } from "./components/starboard-settings";
export { StarboardBoard } from "./components/starboard-board";
```

---

## Step 4: Register in the Central Registry (`src/modules/registry.ts`)

Import and register the module in `src/modules/registry.ts`:

```ts
import { starboardModule } from "./starboard";

registerModule(starboardModule);
```

Once registered, the sidebar navigation and permission-filtered route links update automatically across the entire dashboard.

---

## Step 5: Create Route Segment (`src/app/guild/[guildId]/starboard/page.tsx`)

```tsx
import { authorizedGuild } from "#/lib/auth-guards";
import { ModuleBoundary } from "#/components/layout/ModuleBoundary";
import { StarboardSettings } from "#/modules/starboard";

export default async function StarboardPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  await authorizedGuild(guildId);

  return (
    <ModuleBoundary moduleId="starboard" capability="starboard.view">
      <StarboardSettings guildId={guildId} />
    </ModuleBoundary>
  );
}
```

---

## Step 6: Verify Build & Tests

Run:
```bash
bun run typecheck
bun test
bun run lint
```
