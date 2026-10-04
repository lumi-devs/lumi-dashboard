import type { ModulePort } from "#/ports/ModulePort";
import { ValidationError } from "#/core/errors/AppError";

export interface UpdateModuleConfigInput {
  guildId: string;
  actorId: string;
  moduleName: string;
  key?: string;
  value?: unknown;
  values?: Record<string, unknown>;
}

export class UpdateModuleConfig {
  constructor(private readonly modulePort: ModulePort) {}

  async execute(input: UpdateModuleConfigInput): Promise<Record<string, unknown> | boolean>;
  async execute(
    guildId: string,
    actorId: string,
    moduleName: string,
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  async execute(
    guildId: string,
    actorId: string,
    moduleName: string,
    key: string,
    value: unknown,
  ): Promise<boolean>;
  async execute(
    inputOrGuildId: UpdateModuleConfigInput | string,
    maybeActorId?: string,
    maybeModuleName?: string,
    maybeKeyOrValues?: string | Record<string, unknown>,
    maybeValue?: unknown,
  ): Promise<Record<string, unknown> | boolean> {
    let input: UpdateModuleConfigInput;

    if (typeof inputOrGuildId === "string") {
      if (typeof maybeKeyOrValues === "object" && maybeKeyOrValues !== null) {
        input = {
          guildId: inputOrGuildId,
          actorId: maybeActorId!,
          moduleName: maybeModuleName!,
          values: maybeKeyOrValues,
        };
      } else {
        input = {
          guildId: inputOrGuildId,
          actorId: maybeActorId!,
          moduleName: maybeModuleName!,
          key: maybeKeyOrValues,
          value: maybeValue,
        };
      }
    } else {
      input = inputOrGuildId;
    }

    if (!input.guildId) throw new ValidationError("guildId is required");
    if (!input.actorId) throw new ValidationError("actorId is required");
    if (!input.moduleName) throw new ValidationError("moduleName is required");

    if (input.values !== undefined) {
      return this.modulePort.setModuleConfigMany(
        input.guildId,
        input.actorId,
        input.moduleName,
        input.values,
      );
    }

    if (input.key !== undefined) {
      return this.modulePort.setModuleConfig(
        input.guildId,
        input.actorId,
        input.moduleName,
        input.key,
        input.value,
      );
    }

    throw new ValidationError("Either 'key' or 'values' must be provided to update module config");
  }
}
