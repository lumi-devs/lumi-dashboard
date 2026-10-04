import type { ModulePort } from "#/ports/ModulePort";
import { ValidationError } from "#/core/errors/AppError";

export interface ToggleModuleInput {
  guildId: string;
  actorId: string;
  moduleName: string;
  enabled: boolean;
}

export class ToggleModule {
  constructor(private readonly modulePort: ModulePort) {}

  async execute(input: ToggleModuleInput): Promise<boolean>;
  async execute(
    guildId: string,
    actorId: string,
    moduleName: string,
    enabled: boolean,
  ): Promise<boolean>;
  async execute(
    inputOrGuildId: ToggleModuleInput | string,
    maybeActorId?: string,
    maybeModuleName?: string,
    maybeEnabled?: boolean,
  ): Promise<boolean> {
    const { guildId, actorId, moduleName, enabled } =
      typeof inputOrGuildId === "string"
        ? {
            guildId: inputOrGuildId,
            actorId: maybeActorId!,
            moduleName: maybeModuleName!,
            enabled: maybeEnabled!,
          }
        : inputOrGuildId;

    if (!guildId) throw new ValidationError("guildId is required");
    if (!actorId) throw new ValidationError("actorId is required");
    if (!moduleName) throw new ValidationError("moduleName is required");
    if (typeof enabled !== "boolean") throw new ValidationError("enabled must be a boolean");

    return this.modulePort.setModuleEnabled(guildId, actorId, moduleName, enabled);
  }
}
