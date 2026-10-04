import type { GuildPort } from "#/ports/GuildPort";
import type { GuildOverview } from "#/domain/guild/Guild";
import { ValidationError } from "#/core/errors/AppError";

export interface GetGuildOverviewInput {
  guildId: string;
  actorId: string;
}

export class GetGuildOverview {
  constructor(private readonly guildPort: GuildPort) {}

  async execute(input: GetGuildOverviewInput): Promise<GuildOverview>;
  async execute(guildId: string, actorId: string): Promise<GuildOverview>;
  async execute(
    inputOrGuildId: GetGuildOverviewInput | string,
    maybeActorId?: string,
  ): Promise<GuildOverview> {
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

    return this.guildPort.getGuildOverview(guildId, actorId);
  }
}
