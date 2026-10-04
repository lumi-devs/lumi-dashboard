import "server-only";
import { getGuildPort, getModulePort, getAuditPort } from "#/infrastructure";
import type { GuildPort } from "#/ports/GuildPort";
import type { ModulePort } from "#/ports/ModulePort";
import type { AuditPort, AuditListFilter } from "#/ports/AuditPort";

import { GetGuildOverview, type GetGuildOverviewInput } from "./guild/GetGuildOverview";
import { GetGuildChannels, type GetGuildChannelsInput } from "./guild/GetGuildChannels";
import { GetGuildRoles, type GetGuildRolesInput } from "./guild/GetGuildRoles";
import { GetModuleConfig, type GetModuleConfigInput } from "./modules/GetModuleConfig";
import { UpdateModuleConfig, type UpdateModuleConfigInput } from "./modules/UpdateModuleConfig";
import { ToggleModule, type ToggleModuleInput } from "./modules/ToggleModule";
import { GetRecentAuditLogs, type GetRecentAuditLogsInput } from "./audit/GetRecentAuditLogs";

export {
  GetGuildOverview,
  GetGuildChannels,
  GetGuildRoles,
  GetModuleConfig,
  UpdateModuleConfig,
  ToggleModule,
  GetRecentAuditLogs,
};

export type {
  GetGuildOverviewInput,
  GetGuildChannelsInput,
  GetGuildRolesInput,
  GetModuleConfigInput,
  UpdateModuleConfigInput,
  ToggleModuleInput,
  GetRecentAuditLogsInput,
};

export interface ApplicationContainer {
  getGuildOverview: GetGuildOverview;
  getGuildChannels: GetGuildChannels;
  getGuildRoles: GetGuildRoles;
  getModuleConfig: GetModuleConfig;
  updateModuleConfig: UpdateModuleConfig;
  toggleModule: ToggleModule;
  getRecentAuditLogs: GetRecentAuditLogs;
}

const globalForApplication = globalThis as unknown as {
  applicationContainer?: ApplicationContainer;
};

export function createApplication(ports?: {
  guildPort?: GuildPort;
  modulePort?: ModulePort;
  auditPort?: AuditPort;
}): ApplicationContainer {
  const guildPort = ports?.guildPort ?? getGuildPort();
  const modulePort = ports?.modulePort ?? getModulePort();
  const auditPort = ports?.auditPort ?? getAuditPort();

  return {
    getGuildOverview: new GetGuildOverview(guildPort),
    getGuildChannels: new GetGuildChannels(guildPort),
    getGuildRoles: new GetGuildRoles(guildPort),
    getModuleConfig: new GetModuleConfig(modulePort),
    updateModuleConfig: new UpdateModuleConfig(modulePort),
    toggleModule: new ToggleModule(modulePort),
    getRecentAuditLogs: new GetRecentAuditLogs(auditPort),
  };
}

export function getApplication(): ApplicationContainer {
  if (!globalForApplication.applicationContainer) {
    globalForApplication.applicationContainer = createApplication();
  }
  return globalForApplication.applicationContainer;
}

// Runner functions
export async function getGuildOverview(
  guildIdOrInput: string | GetGuildOverviewInput,
  actorId?: string,
) {
  if (typeof guildIdOrInput === "string") {
    return getApplication().getGuildOverview.execute(guildIdOrInput, actorId!);
  }
  return getApplication().getGuildOverview.execute(guildIdOrInput);
}

export async function getGuildChannels(
  guildIdOrInput: string | GetGuildChannelsInput,
  actorId?: string,
) {
  if (typeof guildIdOrInput === "string") {
    return getApplication().getGuildChannels.execute(guildIdOrInput, actorId!);
  }
  return getApplication().getGuildChannels.execute(guildIdOrInput);
}

export async function getGuildRoles(
  guildIdOrInput: string | GetGuildRolesInput,
  actorId?: string,
) {
  if (typeof guildIdOrInput === "string") {
    return getApplication().getGuildRoles.execute(guildIdOrInput, actorId!);
  }
  return getApplication().getGuildRoles.execute(guildIdOrInput);
}

export async function getModuleConfig(
  guildIdOrInput: string | GetModuleConfigInput,
  actorId?: string,
  moduleName?: string,
) {
  if (typeof guildIdOrInput === "string") {
    return getApplication().getModuleConfig.execute(guildIdOrInput, actorId!, moduleName!);
  }
  return getApplication().getModuleConfig.execute(guildIdOrInput);
}

export async function updateModuleConfig(
  inputOrGuildId: UpdateModuleConfigInput | string,
  actorId?: string,
  moduleName?: string,
  keyOrValues?: string | Record<string, unknown>,
  value?: unknown,
) {
  if (typeof inputOrGuildId === "string") {
    if (typeof keyOrValues === "object" && keyOrValues !== null) {
      return getApplication().updateModuleConfig.execute(
        inputOrGuildId,
        actorId!,
        moduleName!,
        keyOrValues,
      );
    }
    return getApplication().updateModuleConfig.execute(
      inputOrGuildId,
      actorId!,
      moduleName!,
      keyOrValues as string,
      value,
    );
  }
  return getApplication().updateModuleConfig.execute(inputOrGuildId);
}

export async function toggleModule(
  guildIdOrInput: string | ToggleModuleInput,
  actorId?: string,
  moduleName?: string,
  enabled?: boolean,
) {
  if (typeof guildIdOrInput === "string") {
    return getApplication().toggleModule.execute(
      guildIdOrInput,
      actorId!,
      moduleName!,
      enabled!,
    );
  }
  return getApplication().toggleModule.execute(guildIdOrInput);
}

export async function getRecentAuditLogs(
  actorIdOrInput: string | GetRecentAuditLogsInput,
  guildId?: string,
  filter?: AuditListFilter,
) {
  if (typeof actorIdOrInput === "string") {
    return getApplication().getRecentAuditLogs.execute(actorIdOrInput, guildId, filter);
  }
  return getApplication().getRecentAuditLogs.execute(actorIdOrInput);
}
