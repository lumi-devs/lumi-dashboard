import type { Capability } from "#/domain/permissions/Capability";
import type { GuildPermit, PermitNode, UserPermissionContext } from "#/domain/permissions/Permission";

export interface PermissionService {
  getUserPermissions(guildId: string, actorId: string): Promise<UserPermissionContext>;
  checkCapability(guildId: string, actorId: string, capability: Capability): Promise<boolean>;
  getGuildPermits(guildId: string, actorId: string): Promise<GuildPermit[]>;
  createPermit(guildId: string, actorId: string, name: string, nodes: PermitNode[]): Promise<boolean>;
  updatePermit(guildId: string, actorId: string, name: string, nodes: PermitNode[]): Promise<boolean>;
  deletePermit(guildId: string, actorId: string, name: string): Promise<boolean>;
  assignPermit(guildId: string, actorId: string, name: string, targetId: string, type: "role" | "user"): Promise<boolean>;
  unassignPermit(guildId: string, actorId: string, name: string, targetId: string, type: "role" | "user"): Promise<boolean>;
}
