import type { Capability } from "#/domain/permissions/Capability";
import type {
  GuildPermit,
  PermitNode,
  UserPermissionContext,
} from "#/domain/permissions/Permission";

export interface PermissionPort {
  getUserPermissions(guildId: string, actorId: string): Promise<UserPermissionContext>;
  checkCapability(guildId: string, actorId: string, capability: Capability): Promise<boolean>;
  getGuildPermits(guildId: string, actorId: string): Promise<GuildPermit[]>;
  createPermit(
    guildId: string,
    actorId: string,
    name: string,
    nodes: PermitNode[],
    kind?: "enforced" | "custom",
  ): Promise<{ success: boolean; permitId?: number }>;
  updatePermit(
    guildId: string,
    actorId: string,
    permitId: number,
    data: { name?: string; nodes?: PermitNode[] },
  ): Promise<boolean>;
  deletePermit(guildId: string, actorId: string, permitId: number): Promise<boolean>;
  assignPermit(
    guildId: string,
    actorId: string,
    permitId: number,
    targetId: string,
    targetType: "role" | "user",
  ): Promise<boolean>;
  unassignPermit(
    guildId: string,
    actorId: string,
    permitId: number,
    targetId: string,
    targetType: "role" | "user",
  ): Promise<boolean>;
}

export type { PermissionService } from "./PermissionService";
