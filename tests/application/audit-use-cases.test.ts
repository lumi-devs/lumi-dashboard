import { describe, expect, it, vi } from "bun:test";
import { GetRecentAuditLogs } from "#/application/audit/GetRecentAuditLogs";
import { ValidationError } from "#/core/errors/AppError";
import type { AuditPort } from "#/ports/AuditPort";

function makeMockAuditPort(): AuditPort {
  return {
    listGuildAudit: vi.fn().mockResolvedValue({
      entries: [
        {
          id: "log1",
          guildId: "g1",
          actorId: "user1",
          action: "guild.module.toggle",
          platform: "web",
          createdAt: "2026-10-01T00:00:00Z",
        },
      ],
      nextCursor: null,
      total: 1,
    }),
    listSystemAudit: vi.fn().mockResolvedValue({
      entries: [
        {
          id: "sys1",
          actorId: "owner1",
          action: "system.restart",
          platform: "web",
          createdAt: "2026-10-01T00:00:00Z",
        },
      ],
      nextCursor: null,
      total: 1,
    }),
  };
}

describe("Audit Use Cases", () => {
  describe("GetRecentAuditLogs", () => {
    it("fetches guild audit logs when guildId is provided", async () => {
      const port = makeMockAuditPort();
      const useCase = new GetRecentAuditLogs(port);

      const res = await useCase.execute("user1", "g1");
      expect(res.entries).toHaveLength(1);
      expect(res.entries[0]?.action).toBe("guild.module.toggle");
      expect(port.listGuildAudit).toHaveBeenCalledWith("g1", "user1", undefined);
    });

    it("fetches system audit logs when guildId is omitted", async () => {
      const port = makeMockAuditPort();
      const useCase = new GetRecentAuditLogs(port);

      const res = await useCase.execute("owner1");
      expect(res.entries).toHaveLength(1);
      expect(res.entries[0]?.action).toBe("system.restart");
      expect(port.listSystemAudit).toHaveBeenCalledWith("owner1", undefined);
    });

    it("throws ValidationError when actorId is missing", async () => {
      const port = makeMockAuditPort();
      const useCase = new GetRecentAuditLogs(port);

      await expect(useCase.execute("")).rejects.toThrow(ValidationError);
    });
  });
});
