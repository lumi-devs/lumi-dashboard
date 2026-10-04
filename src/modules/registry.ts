import type { LucideIcon } from "lucide-react";
import type { DashboardModule } from "#/domain/modules/DashboardModule";
import type { GuildContextValue } from "#/core/guild/GuildContext";
import type { Capability } from "#/domain/permissions/Capability";
import { moderationModule } from "./moderation/definition";
import { securityModule } from "./security/definition";
import { reactionRolesModule } from "./reaction-roles/definition";
import { tempvcModule } from "./tempvc/definition";
import { verificationModule } from "./verification/definition";
import { afkModule } from "./afk/definition";
import { appealsModule } from "./appeals/definition";
import { overviewModule } from "./overview/definition";
import { setupModule } from "./setup/definition";
import { guildConfigModule } from "./guild-config/definition";

export interface NavigationSectionItem {
  title: string;
  href: string;
  icon?: LucideIcon | string;
  requiredCapabilities?: Capability[];
  badge?: number | string;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationSectionItem[];
}

const defaultModules: DashboardModule[] = [
  overviewModule,
  setupModule,
  guildConfigModule,
  moderationModule,
  securityModule,
  reactionRolesModule,
  tempvcModule,
  verificationModule,
  afkModule,
  appealsModule,
];

const modulesRegistry = new Map<string, DashboardModule>();

export function registerDefaultModules(): void {
  for (const mod of defaultModules) {
    modulesRegistry.set(mod.id, mod);
  }
}

registerDefaultModules();

export function registerModule(module: DashboardModule): void {
  modulesRegistry.set(module.id, module);
}

export function getRegisteredModules(): DashboardModule[] {
  return Array.from(modulesRegistry.values());
}

export function getModuleById(id: string): DashboardModule | undefined {
  return modulesRegistry.get(id);
}

export function clearRegistry(): void {
  modulesRegistry.clear();
}

function resolveHref(
  href: string | ((guildId: string) => string),
  guildId: string,
): string {
  let resolved = typeof href === "function" ? href(guildId) : href;
  resolved = resolved
    .replace(":guildId", guildId)
    .replace("[guildId]", guildId);

  if (
    !resolved.startsWith("http://") &&
    !resolved.startsWith("https://") &&
    !resolved.startsWith(`/guild/${guildId}`)
  ) {
    if (resolved.startsWith("/")) {
      resolved = `/guild/${guildId}${resolved}`;
    }
  }

  return resolved;
}

export function getDynamicNavigation(ctx: GuildContextValue): NavigationSection[] {
  const sectionsMap = new Map<string, NavigationSection>();

  for (const dashModule of modulesRegistry.values()) {
    if (dashModule.isAvailable && !dashModule.isAvailable(ctx)) {
      continue;
    }

    for (const item of dashModule.navigation) {
      if (item.requiredCapabilities && item.requiredCapabilities.length > 0) {
        const hasAllCaps = item.requiredCapabilities.every((cap) =>
          ctx.hasCapability(cap),
        );
        if (!hasAllCaps) {
          continue;
        }
      } else if (dashModule.capabilities.length > 0) {
        const hasAnyModuleCap = dashModule.capabilities.some((cap) =>
          ctx.hasCapability(cap),
        );
        if (!hasAnyModuleCap) {
          continue;
        }
      }

      const sectionTitle = item.section;
      const sectionId = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      let section = sectionsMap.get(sectionTitle);
      if (!section) {
        section = {
          id: sectionId,
          title: sectionTitle,
          items: [],
        };
        sectionsMap.set(sectionTitle, section);
      }

      section.items.push({
        title: item.title,
        href: resolveHref(item.href, ctx.guild.id),
        icon: item.icon,
        requiredCapabilities: item.requiredCapabilities,
      });
    }
  }

  return Array.from(sectionsMap.values());
}
