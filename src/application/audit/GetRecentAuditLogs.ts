import type { AuditPort, AuditListFilter, AuditListResult } from "#/ports/AuditPort";
import { ValidationError } from "#/core/errors/AppError";

export interface GetRecentAuditLogsInput {
  actorId: string;
  guildId?: string;
  filter?: AuditListFilter;
}

export class GetRecentAuditLogs {
  constructor(private readonly auditPort: AuditPort) {}

  async execute(input: GetRecentAuditLogsInput): Promise<AuditListResult>;
  async execute(
    actorId: string,
    guildId?: string,
    filter?: AuditListFilter,
  ): Promise<AuditListResult>;
  async execute(
    inputOrActorId: GetRecentAuditLogsInput | string,
    maybeGuildId?: string,
    maybeFilter?: AuditListFilter,
  ): Promise<AuditListResult> {
    const input: GetRecentAuditLogsInput =
      typeof inputOrActorId === "string"
        ? { actorId: inputOrActorId, guildId: maybeGuildId, filter: maybeFilter }
        : inputOrActorId;

    if (!input.actorId) {
      throw new ValidationError("actorId is required");
    }

    if (input.guildId) {
      return this.auditPort.listGuildAudit(input.guildId, input.actorId, input.filter);
    }
    return this.auditPort.listSystemAudit(input.actorId, input.filter);
  }
}
