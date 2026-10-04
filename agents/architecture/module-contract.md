# Module Contract & Registry

The dashboard operates as a **pluggable host for modules** rather than a monolithic application hardcoding feature routes.

---

## 1. The `DashboardModule` Contract

Defined in `src/domain/modules/DashboardModule.ts`:

```ts
export interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ModuleCategory; // 'moderation' | 'engagement' | 'utility' | 'security' | 'system'
  capabilities: Capability[];
  navigation: NavigationItem[];
  configurationKey?: string;
  permissions?: string[];
  isAvailable?: (ctx: GuildContextValue) => boolean;
}
```

Every domain module under `src/modules/<name>/` implements this contract in `definition.ts` via `defineDashboardModule({...})`.

---

## 2. Dynamic Navigation & Capability Filtering

The central registry in `src/modules/registry.ts` discovers and aggregates all registered modules:

```ts
export function getDynamicNavigation(ctx: GuildContextValue): NavigationSection[];
```

### Derivation Workflow
1. **Module Discovery**: Reads all modules registered in `src/modules/registry.ts`.
2. **Context Evaluation**: Evaluates whether the module is enabled on the guild (`ctx.isOwner || ctx.hasCapability(...)`).
3. **Capability Filtering**: Filters navigation items based on `item.requiredCapabilities`.
4. **Section Grouping**: Automatically buckets links into sidebar sections (`Moderation`, `Security`, `Server Tools`, `Configuration`).

### Result
Adding a new module automatically integrates it into the sidebar navigation and permission system without modifying any global layout components.
