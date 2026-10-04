import type { LucideIcon } from "lucide-react";
import type { Capability } from "../permissions/Capability";
import type { GuildContextValue } from "#/core/guild/GuildContext";

export type ModuleCategory =
  | "moderation"
  | "engagement"
  | "utility"
  | "security"
  | "system";

export interface NavigationItem {
  section: string;
  title: string;
  href: string | ((guildId: string) => string);
  icon?: LucideIcon | string;
  requiredCapabilities?: Capability[];
}

export interface DashboardModule {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon | string;
  category: ModuleCategory;
  capabilities: Capability[];
  navigation: NavigationItem[];
  configurationKey?: string;
  permissions?: string[];
  isAvailable?: (ctx: GuildContextValue) => boolean;
}

export function defineDashboardModule(mod: DashboardModule): DashboardModule {
  return mod;
}
