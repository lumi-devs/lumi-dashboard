import { beforeEach, describe, expect, it } from "bun:test";
import {
  clearRegistry,
  getDynamicNavigation,
  getModuleById,
  getRegisteredModules,
  registerModule,
} from "#/modules/registry";
import type { DashboardModule } from "#/domain/modules/DashboardModule";
import type { GuildContextValue } from "#/core/guild/GuildContext";
import type { Guild } from "#/domain/guild/Guild";
import type { Viewer } from "#/domain/auth/User";

describe("Module Registry & Dynamic Navigation", () => {
  const mockGuild: Guild = {
    id: "g100",
    name: "Registry Guild",
    icon: null,
    banner: null,
    memberCount: 5,
    settings: { prefix: "!", locale: "en" },
  };

  const mockViewer: Viewer = {
    id: "u1",
    username: "test",
    isOwner: false,
    isBotOwner: false,
  };

  const createGuildContext = (
    caps: string[] = [],
    isAdmin = false,
    isOwner = false,
  ): GuildContextValue => {
    const capSet = new Set(caps);
    return {
      guild: mockGuild,
      viewer: mockViewer,
      capabilities: capSet as any,
      hasCapability: (cap) => {
        if (isOwner) return true;
        if (isAdmin && !cap.startsWith("owner.")) return true;
        return capSet.has(cap);
      },
      isOwner,
      isAdmin,
    };
  };

  beforeEach(() => {
    clearRegistry();
  });

  const sampleMod1: DashboardModule = {
    id: "moderation",
    name: "Moderation",
    description: "Mod tools",
    icon: "Shield",
    category: "moderation",
    capabilities: ["moderation.view"],
    navigation: [
      {
        section: "Discipline",
        title: "Cases",
        href: "/moderation",
        requiredCapabilities: ["moderation.view"],
      },
      {
        section: "Discipline",
        title: "Blocklist",
        href: "/guild/:guildId/moderation/blocklist",
        requiredCapabilities: ["moderation.view"],
      },
    ],
  };

  const sampleMod2: DashboardModule = {
    id: "security",
    name: "Security",
    description: "Security features",
    icon: "Lock",
    category: "security",
    capabilities: ["security.manage"],
    navigation: [
      {
        section: "Safety",
        title: "Panic Button",
        href: (guildId) => `/guild/${guildId}/security/panic`,
        requiredCapabilities: ["security.manage"],
      },
    ],
    isAvailable: (ctx) => ctx.guild.memberCount >= 5,
  };

  it("registers modules and retrieves them", () => {
    registerModule(sampleMod1);
    registerModule(sampleMod2);

    expect(getRegisteredModules()).toHaveLength(2);
    expect(getModuleById("moderation")).toBe(sampleMod1);
    expect(getModuleById("unknown")).toBeUndefined();
  });

  it("registers default domain feature modules", () => {
    const { registerDefaultModules } = require("#/modules/registry");
    registerDefaultModules();
    expect(getRegisteredModules().length).toBeGreaterThanOrEqual(6);
    expect(getModuleById("moderation")).toBeDefined();
    expect(getModuleById("security")).toBeDefined();
    expect(getModuleById("reaction-roles")).toBeDefined();
    expect(getModuleById("tempvc")).toBeDefined();
    expect(getModuleById("verification")).toBeDefined();
    expect(getModuleById("afk")).toBeDefined();
  });

  it("filters dynamic navigation based on user capabilities", () => {
    registerModule(sampleMod1);
    registerModule(sampleMod2);

    // User has moderation capability only
    const ctx = createGuildContext(["moderation.view"]);
    const sections = getDynamicNavigation(ctx);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("Discipline");
    expect(sections[0]?.items).toHaveLength(2);
    expect(sections[0]?.items[0]?.href).toBe("/guild/g100/moderation");
    expect(sections[0]?.items[1]?.href).toBe("/guild/g100/moderation/blocklist");
  });

  it("hides navigation if module isAvailable returns false", () => {
    const limitedMod: DashboardModule = {
      ...sampleMod2,
      isAvailable: () => false,
    };

    registerModule(limitedMod);

    const ctx = createGuildContext(["security.manage"]);
    const sections = getDynamicNavigation(ctx);

    expect(sections).toHaveLength(0);
  });

  it("allows admin or owner to access navigation", () => {
    registerModule(sampleMod1);
    registerModule(sampleMod2);

    const ctx = createGuildContext([], true, false); // Admin
    const sections = getDynamicNavigation(ctx);

    expect(sections).toHaveLength(2);
    expect(sections.map((s) => s.title)).toEqual(["Discipline", "Safety"]);
  });
});
