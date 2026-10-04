import type { Module, ModuleSummary } from "#/domain/modules/Module";

export interface ModulePort {
  getModules(guildId: string, actorId: string): Promise<ModuleSummary[]>;
  getModule(guildId: string, actorId: string, moduleName: string): Promise<Module | null>;
  setModuleEnabled(
    guildId: string,
    actorId: string,
    moduleName: string,
    enabled: boolean,
  ): Promise<boolean>;
  setModuleConfig(
    guildId: string,
    actorId: string,
    moduleName: string,
    key: string,
    value: unknown,
  ): Promise<boolean>;
  setModuleConfigMany(
    guildId: string,
    actorId: string,
    moduleName: string,
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}

export type { ModuleRepository } from "./ModuleRepository";
