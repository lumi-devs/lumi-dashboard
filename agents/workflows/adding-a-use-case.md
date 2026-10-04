# Adding an Application Use Case

Use this recipe to introduce a new business operation or orchestration use case in `src/application/`.

---

## Step 1: Define Port Method (if needed)

If the use case requires fetching or mutating data not already covered by existing ports, add the abstract method to the relevant port interface:

```ts
// src/ports/GuildPort.ts
export interface GuildPort {
  // ...
  getAuditSummary(guildId: string, actorId: string): Promise<AuditSummary>;
}
```

Implement the method in the corresponding infrastructure adapter:

```ts
// src/infrastructure/rpc/repositories/RpcGuildRepository.ts
export class RpcGuildRepository implements GuildPort {
  // ...
  async getAuditSummary(guildId: string, actorId: string): Promise<AuditSummary> {
    const res = await callRpc("guild.audit.summary", { guildId, actorId });
    return mapToAuditSummary(res);
  }
}
```

---

## Step 2: Create the Use Case Class

Create a dedicated file under `src/application/<domain>/`:

```ts
// src/application/guild/GetAuditSummary.ts
import type { GuildPort } from "#/ports/GuildPort";

export interface GetAuditSummaryInput {
  guildId: string;
  actorId: string;
}

export class GetAuditSummary {
  constructor(private readonly guildPort: GuildPort) {}

  async execute(input: GetAuditSummaryInput) {
    if (!input.guildId || !input.actorId) {
      throw new Error("guildId and actorId are required");
    }
    return this.guildPort.getAuditSummary(input.guildId, input.actorId);
  }
}
```

---

## Step 3: Register in Application Container (`src/application/index.ts`)

Wire the use case into `src/application/index.ts`:

```ts
import { GetAuditSummary } from "./guild/GetAuditSummary";

export interface ApplicationContainer {
  // ...
  getAuditSummary: GetAuditSummary;
}

export function createApplication(ports?: ...): ApplicationContainer {
  // ...
  return {
    // ...
    getAuditSummary: new GetAuditSummary(guildPort),
  };
}

export async function getAuditSummary(guildId: string, actorId: string) {
  return getApplication().getAuditSummary.execute({ guildId, actorId });
}
```

---

## Step 4: Consume in Server Component or Action

In a server component:
```tsx
import { getAuditSummary } from "#/application";

const summary = await getAuditSummary(guildId, session.userId);
```

Or in a Server Action:
```ts
// src/actions/audit-actions.ts
"use server";
import { getAuditSummary } from "#/application";
import { guildAction } from "./_guard";

export async function fetchAuditSummary(guildId: string) {
  return guildAction(guildId, async (session) => {
    const summary = await getAuditSummary(guildId, session.userId);
    return { ok: true, data: summary };
  });
}
```
