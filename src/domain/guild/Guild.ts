export interface GuildSettings {
  prefix: string | null;
  locale: string;
  [key: string]: unknown;
}

export interface GuildRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
  isBotRole: boolean;
}

export interface GuildChannel {
  id: string;
  name: string;
  type: number;
}

export interface GuildMemberSample {
  id: string;
  username: string;
  displayName: string;
}

export interface GuildSummary {
  id: string;
  name?: string;
  icon: string | null;
  banner: string | null;
  memberCount: number | null;
  canManage?: boolean;
}

export interface GuildOverview {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  memberCount: number;
  rolesCount: number;
  channelsCount: number;
  modulesEnabledCount: number;
  panicActive: boolean;
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  ownerId?: string | null;
  memberCount: number;
  features?: string[];
  settings: GuildSettings;
}
