import type { PermitNode } from "@lumi/contracts";
import { type Capability, CAPABILITY_PERMIT_MAP } from "./Capability";

export type { PermitNode };

export interface PermitAssignment {
  roleIds: string[];
  userIds: string[];
}

export interface GuildPermit {
  id?: number;
  name: string;
  kind?: string;
  builtin?: boolean;
  nodes: PermitNode[];
  roles: string[];
  users: string[];
}

export interface UserPermissionContext {
  userId: string;
  guildId?: string;
  isBotOwner: boolean;
  isGuildOwner?: boolean;
  guildPermissions?: bigint | string;
  permitNodes?: PermitNode[];
}

export function hasPermitNode(userNodes: readonly string[], requiredNode: string): boolean {
  if (userNodes.includes(requiredNode)) return true;

  const [reqPrefix] = requiredNode.split(".");
  if (reqPrefix && userNodes.includes(`${reqPrefix}.*`)) return true;

  if (userNodes.includes("*")) return true;

  return false;
}

export function hasCapability(ctx: UserPermissionContext, capability: Capability): boolean {
  if (ctx.isBotOwner) return true;
  if (ctx.isGuildOwner) return true;

  const mappedPermits = CAPABILITY_PERMIT_MAP[capability];
  if (mappedPermits && mappedPermits.length === 0) {
    return true;
  }

  if (!ctx.permitNodes || ctx.permitNodes.length === 0) return false;

  if (mappedPermits && mappedPermits.length > 0) {
    return mappedPermits.some((node) => hasPermitNode(ctx.permitNodes ?? [], node));
  }

  return hasPermitNode(ctx.permitNodes, capability);
}
