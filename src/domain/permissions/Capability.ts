import type { PermitNode } from "@lumi/contracts";

export type Capability =
  | "guild.view"
  | "guild.settings.update"
  | "admin.manage"
  | "admin.config"
  | "admin.welcome"
  | "moderation.view"
  | "moderation.update"
  | "mod.manage"
  | "mod.lockdown"
  | "mod.notes"
  | "mod.softBan"
  | "mod.voiceMute"
  | "mod.say"
  | "mod.dm"
  | "automod.manage"
  | "security.manage"
  | "economy.manage"
  | "economy.admin"
  | "reactionroles.manage"
  | "owner.manage"
  | "owner.serverlock"
  | "owner.leave"
  | "owner.announce"
  | "logging.claim"
  | (string & {});

export const CAPABILITY_PERMIT_MAP: Record<string, PermitNode[]> = {
  "guild.view": [],
  "guild.settings.update": ["admin.*", "admin.config"],
  "admin.manage": ["admin.*"],
  "admin.config": ["admin.config", "admin.*"],
  "admin.welcome": ["admin.welcome", "admin.*"],
  "moderation.view": ["mod.*", "admin.*"],
  "moderation.update": ["mod.*", "admin.*"],
  "mod.manage": ["mod.*", "admin.*"],
  "mod.lockdown": ["mod.lockdown", "mod.*", "admin.*"],
  "mod.notes": ["mod.notes", "mod.*", "admin.*"],
  "mod.softBan": ["mod.softBan", "mod.*", "admin.*"],
  "mod.voiceMute": ["mod.voiceMute", "mod.*", "admin.*"],
  "mod.say": ["mod.say", "mod.*", "admin.*"],
  "mod.dm": ["mod.dm", "mod.*", "admin.*"],
  "automod.manage": ["admin.config", "admin.*"],
  "security.manage": ["admin.*"],
  "economy.manage": ["economy.*", "admin.*"],
  "economy.admin": ["economy.admin", "economy.*", "admin.*"],
  "reactionroles.manage": ["reactionroles.manage", "reactionroles.*", "admin.*"],
  "owner.manage": ["owner.*"],
  "owner.serverlock": ["owner.serverlock", "owner.*"],
  "owner.leave": ["owner.leave", "owner.*"],
  "owner.announce": ["owner.announce", "owner.*"],
  "logging.claim": ["logging.claim", "admin.*"],
};
