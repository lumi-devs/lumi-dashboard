import type { ModulePort } from "#/ports/ModulePort";
import type { Module } from "#/domain/modules/Module";
import { ValidationError, ModuleUnavailableError } from "#/core/errors/AppError";

export interface GetModuleConfigInput {
  guildId: string;
  actorId: string;
  moduleName: string;
}

export class GetModuleConfig {
  constructor(private readonly modulePort: ModulePort) {}

  async execute(input: GetModuleConfigInput): Promise<Record<string, unknown>>;
  async execute(
    guildId: string,
    actorId: string,
    moduleName: string,
  ): Promise<Record<string, unknown>>;
  async execute(
    inputOrGuildId: GetModuleConfigInput | string,
    maybeActorId?: string,
    maybeModuleName?: string,
  ): Promise<Record<string, unknown>> {
    const { guildId, actorId, moduleName } =
      typeof inputOrGuildId === "string"
        ? {
            guildId: inputOrGuildId,
            actorId: maybeActorId!,
            moduleName: maybeModuleName!,
          }
        : inputOrGuildId;

    if (!guildId) {
      throw new ValidationError("guildId is required");
    }
    if (!actorId) {
      throw new ValidationError("actorId is required");
    }
    if (!moduleName) {
      throw new ValidationError("moduleName is required");
    }

    const mod = await this.modulePort.getModule(guildId, actorId, moduleName);
    if (!mod) {
      throw new ModuleUnavailableError(moduleName);
    }

    return mod.config;
  }

  async getModule(
    inputOrGuildId: GetModuleConfigInput | string,
    maybeActorId?: string,
    maybeModuleName?: string,
  ): Promise<Module | null> {
    const { guildId, actorId, moduleName } =
      typeof inputOrGuildId === "string"
        ? {
            guildId: inputOrGuildId,
            actorId: maybeActorId!,
            moduleName: maybeModuleName!,
          }
        : inputOrGuildId;

    if (!guildId) {
      throw new ValidationError("guildId is required");
    }
    if (!actorId) {
      throw new ValidationError("actorId is required");
    }
    if (!moduleName) {
      throw new ValidationError("moduleName is required");
    }

    return this.modulePort.getModule(guildId, actorId, moduleName);
  }
}
