import { describe, expect, it } from "bun:test";
import { getApplication, createApplication } from "#/application";

describe("Application Container", () => {
  it("creates and retrieves default application container", () => {
    const app = getApplication();
    expect(app.getGuildOverview).toBeDefined();
    expect(app.getGuildChannels).toBeDefined();
    expect(app.getGuildRoles).toBeDefined();
    expect(app.getModuleConfig).toBeDefined();
    expect(app.updateModuleConfig).toBeDefined();
    expect(app.toggleModule).toBeDefined();
    expect(app.getRecentAuditLogs).toBeDefined();
  });

  it("can create application container with custom mock ports", () => {
    const customGuildPort: any = { getGuildOverview: () => {} };
    const customModulePort: any = { getModule: () => {} };
    const customAuditPort: any = { listGuildAudit: () => {} };

    const app = createApplication({
      guildPort: customGuildPort,
      modulePort: customModulePort,
      auditPort: customAuditPort,
    });

    expect(app).toBeDefined();
    expect(app.getGuildOverview).toBeDefined();
  });
});
