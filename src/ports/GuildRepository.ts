import type { Guild, GuildSummary, GuildChannel, GuildRole, GuildMemberSample, GuildSettings } from "#/domain/guild/Guild";

export interface GuildRepository {
  getGuild(guildId: string, actorId: string): Promise<Guild>;
  listGuildSummaries(guildIds: string[], actorId: string): Promise<GuildSummary[]>;
  getChannels(guildId: string, actorId: string): Promise<GuildChannel[]>;
  getRoles(guildId: string, actorId: string): Promise<GuildRole[]>;
  getMembersSample(guildId: string, actorId: string): Promise<GuildMemberSample[]>;
  updateSettings(guildId: string, actorId: string, settings: Partial<GuildSettings>): Promise<GuildSettings>;
}
