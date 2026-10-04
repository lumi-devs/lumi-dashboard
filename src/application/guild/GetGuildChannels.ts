import type { GuildPort } from "#/ports/GuildPort";
import type { GuildChannel } from "#/domain/guild/Guild";
import { ValidationError } from "#/core/errors/AppError";

export interface GetGuildChannelsInput {
  guildId: string;
  actorId: string;
}

export class GetGuildChannels {
  constructor(private readonly guildPort: GuildPort) {}

  async execute(input: GetGuildChannelsInput): Promise<GuildChannel[]>;
  async execute(guildId: string, actorId: string): Promise<GuildChannel[]>;
  async execute(
    inputOrGuildId: GetGuildChannelsInput | string,
    maybeActorId?: string,
  ): Promise<GuildChannel[]> {
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

    return this.guildPort.getChannels(guildId, actorId);
  }
}
