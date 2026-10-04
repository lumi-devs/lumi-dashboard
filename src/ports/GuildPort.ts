import type {
  Guild,
  GuildOverview,
  GuildSummary,
  GuildChannel,
  GuildRole,
  GuildMemberSample,
  GuildSettings,
} from "#/domain/guild/Guild";

export interface GuildPort {
  getGuild(guildId: string, actorId: string): Promise<Guild>;
  getGuildOverview(guildId: string, actorId: string): Promise<GuildOverview>;
  listGuildSummaries(guildIds: string[], actorId: string): Promise<GuildSummary[]>;
  getChannels(guildId: string, actorId: string): Promise<GuildChannel[]>;
  getRoles(guildId: string, actorId: string): Promise<GuildRole[]>;
  getMembersSample(guildId: string, actorId: string): Promise<GuildMemberSample[]>;
  updateSettings(
    guildId: string,
    actorId: string,
    settings: { prefix?: string | null; locale?: "en-US" },
  ): Promise<GuildSettings>;
}

export type { GuildRepository } from "./GuildRepository";
