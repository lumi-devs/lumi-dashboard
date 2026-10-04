import "server-only";
import { rpc, RpcError, isGuildMissing } from "#/lib/rpc";
import type {
  AuditEntry,
  AuditListFilter,
  AuditListResult,
  AuditPort,
} from "#/ports/AuditPort";
import type { AuditEntryView } from "@lumi/contracts/views";
import {
  GuildNotFoundError,
  RpcCommunicationError,
} from "#/core/errors/AppError";

function toAuditEntry(dto: AuditEntryView): AuditEntry {
  return {
    id: String(dto.id),
    guildId: dto.guildId ?? undefined,
    actorId: dto.userId,
    action: dto.action,
    platform: dto.platform,
    createdAt: dto.createdAt,
    details:
      dto.details && typeof dto.details === "object"
        ? (dto.details as Record<string, unknown>)
        : undefined,
  };
}

export class RpcAuditRepository implements AuditPort {
  async listGuildAudit(
    guildId: string,
    actorId: string,
    filter: AuditListFilter = {},
  ): Promise<AuditListResult> {
    try {
      const res = await rpc("guild.audit.list", {
        guildId,
        actorId,
        data: {
          pageSize: filter.pageSize,
          cursor: filter.cursor,
          action: filter.action,
          userId: filter.userId,
          platform: filter.platform,
        },
      });

      return {
        entries: res.entries.map(toAuditEntry),
        nextCursor: res.nextCursor,
        total: res.total,
      };
    } catch (err) {
      if (isGuildMissing(err)) {
        throw new GuildNotFoundError(guildId);
      }
      if (err instanceof RpcError) {
        throw new RpcCommunicationError(err.message, {
          code: err.code,
          action: err.action,
          retryable: err.retryable,
          guildId,
        });
      }
      throw err;
    }
  }

  async listSystemAudit(
    actorId: string,
    filter: AuditListFilter = {},
  ): Promise<AuditListResult> {
    try {
      const res = await rpc("system.audit.list", {
        actorId,
        data: {
          pageSize: filter.pageSize,
          cursor: filter.cursor,
          action: filter.action,
          userId: filter.userId,
          platform: filter.platform,
        },
      });

      return {
        entries: res.entries.map(toAuditEntry),
        nextCursor: res.nextCursor,
        total: res.total,
      };
    } catch (err) {
      if (err instanceof RpcError) {
        throw new RpcCommunicationError(err.message, {
          code: err.code,
          action: err.action,
          retryable: err.retryable,
        });
      }
      throw err;
    }
  }
}
