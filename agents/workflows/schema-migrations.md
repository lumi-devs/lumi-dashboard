# Schema Migrations

The dashboard provides a client-side migration runner (`src/domain/modules/migrations/`) to safely transform stored configuration shapes when module schemas evolve across releases.

---

## 1. When to Add a Migration

Add a migration whenever:
- A configuration field is renamed (e.g. `log_channel` $\rightarrow$ `auditChannelId`).
- A single field splits into multiple granular fields.
- Field values change data formats (e.g. string IDs $\rightarrow$ object array with permissions).

---

## 2. Registering a Migration

Use `migrationRunner` (`src/domain/modules/migrations/MigrationRunner.ts`):

```ts
import { migrationRunner } from "#/domain/modules/migrations";

// Register migration for "moderation" module from version 1 to 2
migrationRunner.register("moderation", {
  fromVersion: 1,
  toVersion: 2,
  migrate: (oldConfig) => {
    return {
      ...oldConfig,
      auditChannelId: oldConfig.log_channel,
      dmOnAction: Boolean(oldConfig.dm_user),
    };
  },
});
```

---

## 3. Running Migrations

When loading stored configuration data, execute migrations to reach the target schema version:

```ts
import { migrationRunner } from "#/domain/modules/migrations";

const currentVersion = config.schemaVersion ?? 1;
const TARGET_VERSION = 2;

const upToDateConfig = await migrationRunner.run(
  "moderation",
  currentVersion,
  TARGET_VERSION,
  config.data,
);
```

### Guarantees
- **Sequential Execution**: If migrating from version 1 to 3, the runner automatically chains `1 -> 2` and `2 -> 3`.
- **Downgrade Protection**: Attempting to downgrade a configuration to an older schema version throws an error.
- **Missing Path Detection**: If an intermediate step is missing, it fails fast with a descriptive error.
