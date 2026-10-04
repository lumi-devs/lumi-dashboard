import { describe, expect, it, vi } from "bun:test";
import { GetGuildOverview } from "#/application/guild/GetGuildOverview";
import { GetGuildChannels } from "#/application/guild/GetGuildChannels";
import { GetGuildRoles } from "#/application/guild/GetGuildRoles";
import { ValidationError } from "#/core/errors/AppError";
import type { GuildPort } from "#/ports/GuildPort";

function makeMockGuildPort(): GuildPort {
  return {
    getGuild: vi.fn(),
    getGuildOverview: vi.fn().mockResolvedValue({
      id: "g1",
      name: "Test Guild",
      icon: null,
      banner: null,
      memberCount: 42,
      rolesCount: 5,
      channelsCount: 10,
      modulesEnabledCount: 3,
      panicActive: false,
    }),
    listGuildSummaries: vi.fn(),
    getChannels: vi.fn().mockResolvedValue([
      { id: "c1", name: "general", type: 0 },
      { id: "c2", name: "voice", type: 2 },
    ]),
    getRoles: vi.fn().mockResolvedValue([
      { id: "r1", name: "Admin", color: 0, position: 1, permissions: "8", isBotRole: false },
    ]),
    getMembersSample: vi.fn(),
    updateSettings: vi.fn(),
  };
}

describe("Guild Use Cases", () => {
  describe("GetGuildOverview", () => {
    it("fetches overview with positional args", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildOverview(port);

      const res = await useCase.execute("g1", "user1");
      expect(res.name).toBe("Test Guild");
      expect(port.getGuildOverview).toHaveBeenCalledWith("g1", "user1");
    });

    it("fetches overview with object input", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildOverview(port);

      const res = await useCase.execute({ guildId: "g1", actorId: "user1" });
      expect(res.memberCount).toBe(42);
      expect(port.getGuildOverview).toHaveBeenCalledWith("g1", "user1");
    });

    it("throws ValidationError when guildId is missing", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildOverview(port);

      await expect(useCase.execute("", "user1")).rejects.toThrow(ValidationError);
    });

    it("throws ValidationError when actorId is missing", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildOverview(port);

      await expect(useCase.execute("g1", "")).rejects.toThrow(ValidationError);
    });
  });

  describe("GetGuildChannels", () => {
    it("fetches channels successfully", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildChannels(port);

      const res = await useCase.execute("g1", "user1");
      expect(res).toHaveLength(2);
      expect(res[0]?.name).toBe("general");
      expect(port.getChannels).toHaveBeenCalledWith("g1", "user1");
    });

    it("throws ValidationError when arguments are missing", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildChannels(port);

      await expect(useCase.execute("", "user1")).rejects.toThrow(ValidationError);
      await expect(useCase.execute("g1", "")).rejects.toThrow(ValidationError);
    });
  });

  describe("GetGuildRoles", () => {
    it("fetches roles successfully", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildRoles(port);

      const res = await useCase.execute("g1", "user1");
      expect(res).toHaveLength(1);
      expect(res[0]?.name).toBe("Admin");
      expect(port.getRoles).toHaveBeenCalledWith("g1", "user1");
    });

    it("throws ValidationError when arguments are missing", async () => {
      const port = makeMockGuildPort();
      const useCase = new GetGuildRoles(port);

      await expect(useCase.execute("", "user1")).rejects.toThrow(ValidationError);
      await expect(useCase.execute("g1", "")).rejects.toThrow(ValidationError);
    });
  });
});
