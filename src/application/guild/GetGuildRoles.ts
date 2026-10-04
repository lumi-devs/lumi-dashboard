import type { GuildPort } from "#/ports/GuildPort";
import type { GuildRole } from "#/domain/guild/Guild";
import { ValidationError } from "#/core/errors/AppError";

export interface GetGuildRolesInput {
  guildId: string;
  actorId: string;
}

export class GetGuildRoles {
  constructor(private readonly guildPort: GuildPort) {}

  async execute(input: GetGuildRolesInput): Promise<GuildRole[]>;
  async execute(guildId: string, actorId: string): Promise<GuildRole[]>;
  async execute(
    inputOrGuildId: GetGuildRolesInput | string,
    maybeActorId?: string,
  ): Promise<GuildRole[]> {
    const { guildId, actorId } =
      typeof inputOrGuildId === "string"
        ? { guildId: inputOrGuildId, actorId: maybeActorId! }
        : inputOrGuildId;

    if (!guildId) {
      throw new ValidationError("guildId is required");
    }
    if (!actorId) {
      throw new ValidationError("actorId is required");
    }

    return this.guildPort.getRoles(guildId, actorId);
  }
}
