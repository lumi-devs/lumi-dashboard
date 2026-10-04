import "server-only";
import type { GuildPort } from "#/ports/GuildPort";
import type { ModulePort } from "#/ports/ModulePort";
import type { PermissionPort } from "#/ports/PermissionPort";
import type { AuditPort } from "#/ports/AuditPort";

import { RpcGuildRepository } from "./rpc/repositories/RpcGuildRepository";
import { RpcModuleRepository } from "./rpc/repositories/RpcModuleRepository";
import { RpcPermissionService } from "./rpc/repositories/RpcPermissionService";
import { RpcAuditRepository } from "./rpc/repositories/RpcAuditRepository";

const globalForInfrastructure = globalThis as unknown as {
  guildPort?: GuildPort;
  modulePort?: ModulePort;
  permissionPort?: PermissionPort;
  auditPort?: AuditPort;
};

export function getGuildPort(): GuildPort {
  if (!globalForInfrastructure.guildPort) {
    globalForInfrastructure.guildPort = new RpcGuildRepository();
  }
  return globalForInfrastructure.guildPort;
}

export function getModulePort(): ModulePort {
  if (!globalForInfrastructure.modulePort) {
    globalForInfrastructure.modulePort = new RpcModuleRepository();
  }
  return globalForInfrastructure.modulePort;
}

export function getPermissionPort(): PermissionPort {
  if (!globalForInfrastructure.permissionPort) {
    globalForInfrastructure.permissionPort = new RpcPermissionService();
  }
  return globalForInfrastructure.permissionPort;
}

export function getAuditPort(): AuditPort {
  if (!globalForInfrastructure.auditPort) {
    globalForInfrastructure.auditPort = new RpcAuditRepository();
  }
  return globalForInfrastructure.auditPort;
}

export {
  RpcGuildRepository,
  RpcModuleRepository,
  RpcPermissionService,
  RpcAuditRepository,
};
