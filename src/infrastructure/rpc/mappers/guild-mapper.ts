import type {
  GuildShellData,
  GuildEntitiesData,
  GuildSettings as RpcGuildSettings,
  DashboardRoleView,
  DashboardChannelView,
  DashboardMemberView,
} from "@lumi/contracts/views";
import type { GuildSummaryView } from "@lumi/contracts/rpc";
import type {
  Guild,
  GuildChannel,
  GuildMemberSample,
  GuildRole,
  GuildSettings,
  GuildSummary,
} from "#/domain/guild/Guild";

export function toGuildRole(dto: DashboardRoleView): GuildRole {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color,
    position: dto.position,
    permissions: dto.permissions,
    isBotRole: dto.isBotRole,
  };
}

export function toGuildChannel(dto: DashboardChannelView): GuildChannel {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
  };
}

export function toGuildMemberSample(dto: DashboardMemberView): GuildMemberSample {
  return {
    id: dto.id,
    username: dto.username,
    displayName: dto.displayName,
  };
}

export function toGuildSettings(dto: RpcGuildSettings): GuildSettings {
  const { prefix, locale, ...rest } = dto;
  return {
    prefix,
    locale,
    ...rest,
  };
}

export function toGuild(guildId: string, shell: GuildShellData): Guild {
  return {
    id: guildId,
    name: shell.name,
    icon: shell.icon,
    banner: shell.banner,
    memberCount: shell.memberCount,
    settings: toGuildSettings(shell.settings),
  };
}

export function toGuildSummary(dto: GuildSummaryView): GuildSummary {
  return {
    id: dto.guildId,
    icon: dto.icon,
    banner: dto.banner,
    memberCount: dto.memberCount,
  };
}

export function toGuildEntities(entities: GuildEntitiesData): {
  roles: GuildRole[];
  channels: GuildChannel[];
  members: GuildMemberSample[];
} {
  return {
    roles: entities.roles.map(toGuildRole),
    channels: entities.channels.map(toGuildChannel),
    members: entities.members.map(toGuildMemberSample),
  };
}
