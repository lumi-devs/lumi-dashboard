export interface AuditEntry {
  id: string;
  guildId?: string;
  actorId: string;
  action: string;
  platform: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

export interface AuditListFilter {
  userId?: string;
  action?: string;
  platform?: "discord" | "web";
  pageSize?: number;
  cursor?: string;
}

export interface AuditListResult {
  entries: AuditEntry[];
  nextCursor: string | null;
  total?: number;
}

export interface AuditPort {
  listGuildAudit(
    guildId: string,
    actorId: string,
    filter?: AuditListFilter,
  ): Promise<AuditListResult>;
  listSystemAudit(actorId: string, filter?: AuditListFilter): Promise<AuditListResult>;
}
