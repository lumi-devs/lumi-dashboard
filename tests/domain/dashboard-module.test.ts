import { describe, expect, it } from "bun:test";
import { defineDashboardModule, type DashboardModule } from "#/domain/modules/DashboardModule";

describe("DashboardModule", () => {
  it("defines a dashboard module contract correctly", () => {
    const modConfig: DashboardModule = {
      id: "moderation",
      name: "Moderation",
      description: "Disciplinary actions and case management",
      icon: "ShieldAlert",
      category: "moderation",
      capabilities: ["moderation.view", "moderation.update"],
      navigation: [
        {
          section: "Discipline",
          title: "Cases",
          href: "/moderation",
          requiredCapabilities: ["moderation.view"],
        },
      ],
      configurationKey: "mod",
      permissions: ["MANAGE_MESSAGES"],
    };

    const mod = defineDashboardModule(modConfig);
    expect(mod.id).toBe("moderation");
    expect(mod.category).toBe("moderation");
    expect(mod.capabilities).toContain("moderation.view");
    expect(mod.navigation).toHaveLength(1);
    expect(mod.navigation[0]?.title).toBe("Cases");
  });
});
