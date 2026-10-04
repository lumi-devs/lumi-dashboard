import "server-only";
import { rpc, RpcError, isGuildMissing } from "#/lib/rpc";
import type { PermissionPort } from "#/ports/PermissionPort";
import type { Capability } from "#/domain/permissions/Capability";
import {
  type GuildPermit,
  type PermitNode,
  type UserPermissionContext,
  hasCapability,
} from "#/domain/permissions/Permission";
import type { PermitView } from "@lumi/contracts/rpc";
import {
  GuildNotFoundError,
  RpcCommunicationError,
} from "#/core/errors/AppError";

function handleRpcError(error: unknown, guildId: string): never {
  if (isGuildMissing(error)) {
    throw new GuildNotFoundError(guildId);
  }
  if (error instanceof RpcError) {
    throw new RpcCommunicationError(error.message, {
      code: error.code,
      action: error.action,
      retryable: error.retryable,
      guildId,
    });
  }
  throw error;
}

function toGuildPermit(dto: PermitView): GuildPermit {
  const roles: string[] = [];
  const users: string[] = [];

  for (const a of dto.assignments) {
    if (a.targetType === "role") {
      roles.push(a.targetId);
    } else if (a.targetType === "user") {
      users.push(a.targetId);
    }
  }

  return {
    id: dto.id,
    name: dto.name,
    kind: dto.kind,
    builtin: dto.builtin,
    nodes: dto.nodes as PermitNode[],
    roles,
    users,
  };
}

export class RpcPermissionService implements PermissionPort {
  async getUserPermissions(
    guildId: string,
    actorId: string,
  ): Promise<UserPermissionContext> {
    try {
      const permitsRes = await rpc("guild.permits.list", {
        guildId,
        actorId,
      });

      const userNodes = new Set<PermitNode>();
      for (const p of permitsRes.permits) {
        const matchesUser = p.assignments.some(
          (a) => a.targetType === "user" && a.targetId === actorId,
        );
        if (matchesUser) {
          for (const node of p.nodes) {
            userNodes.add(node as PermitNode);
          }
        }
      }

      return {
        userId: actorId,
        guildId,
        isBotOwner: false,
        permitNodes: Array.from(userNodes),
      };
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async checkCapability(
    guildId: string,
    actorId: string,
    capability: Capability,
  ): Promise<boolean> {
    const ctx = await this.getUserPermissions(guildId, actorId);
    return hasCapability(ctx, capability);
  }

  async getGuildPermits(guildId: string, actorId: string): Promise<GuildPermit[]> {
    try {
      const res = await rpc("guild.permits.list", {
        guildId,
        actorId,
      });
      return res.permits.map(toGuildPermit);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async createPermit(
    guildId: string,
    actorId: string,
    name: string,
    nodes: PermitNode[],
    kind: "enforced" | "custom" = "custom",
  ): Promise<{ success: boolean; permitId?: number }> {
    try {
      const res = await rpc("guild.permits.create", {
        guildId,
        actorId,
        data: { name, kind, nodes },
      });
      return { success: true, permitId: res.permit.id };
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async updatePermit(
    guildId: string,
    actorId: string,
    permitId: number,
    data: { name?: string; nodes?: PermitNode[] },
  ): Promise<boolean> {
    try {
      await rpc("guild.permits.update", {
        guildId,
        actorId,
        data: { permitId, ...data },
      });
      return true;
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async deletePermit(
    guildId: string,
    actorId: string,
    permitId: number,
  ): Promise<boolean> {
    try {
      await rpc("guild.permits.delete", {
        guildId,
        actorId,
        data: { permitId },
      });
      return true;
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async assignPermit(
    guildId: string,
    actorId: string,
    permitId: number,
    targetId: string,
    targetType: "role" | "user",
  ): Promise<boolean> {
    try {
      await rpc("guild.permits.assign", {
        guildId,
        actorId,
        data: { permitId, targetType, targetId },
      });
      return true;
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async unassignPermit(
    guildId: string,
    actorId: string,
    permitId: number,
    targetId: string,
    targetType: "role" | "user",
  ): Promise<boolean> {
    try {
      await rpc("guild.permits.unassign", {
        guildId,
        actorId,
        data: { permitId, targetType, targetId },
      });
      return true;
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }
}
