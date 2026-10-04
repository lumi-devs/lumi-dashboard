import { describe, expect, it, vi } from "bun:test";
import { GetModuleConfig } from "#/application/modules/GetModuleConfig";
import { UpdateModuleConfig } from "#/application/modules/UpdateModuleConfig";
import { ToggleModule } from "#/application/modules/ToggleModule";
import { ModuleUnavailableError, ValidationError } from "#/core/errors/AppError";
import type { ModulePort } from "#/ports/ModulePort";

function makeMockModulePort(): ModulePort {
  return {
    getModules: vi.fn(),
    getModule: vi.fn().mockImplementation((_guildId: string, _actorId: string, moduleName: string) => {
      if (moduleName === "moderation") {
        return Promise.resolve({
          id: "moderation",
          name: "moderation",
          displayName: "Moderation",
          emoji: "🛡️",
          description: "Mod tools",
          version: "1.0.0",
          category: "moderation",
          isAddon: false,
          conflicts: [],
          dependencies: [],
          configFields: [],
          dashboardHref: "/moderation",
          enabled: true,
          config: { logChannel: "123", dmOnAction: true },
        });
      }
      return Promise.resolve(null);
    }),
    setModuleEnabled: vi.fn().mockResolvedValue(true),
    setModuleConfig: vi.fn().mockResolvedValue(true),
    setModuleConfigMany: vi.fn().mockImplementation((_g, _a, _m, values) => Promise.resolve(values)),
  };
}

describe("Module Use Cases", () => {
  describe("GetModuleConfig", () => {
    it("returns config when module exists", async () => {
      const port = makeMockModulePort();
      const useCase = new GetModuleConfig(port);

      const config = await useCase.execute("g1", "user1", "moderation");
      expect(config).toEqual({ logChannel: "123", dmOnAction: true });
    });

    it("throws ModuleUnavailableError when module does not exist", async () => {
      const port = makeMockModulePort();
      const useCase = new GetModuleConfig(port);

      await expect(useCase.execute("g1", "user1", "unknown_module")).rejects.toThrow(
        ModuleUnavailableError,
      );
    });

    it("throws ValidationError when params are missing", async () => {
      const port = makeMockModulePort();
      const useCase = new GetModuleConfig(port);

      await expect(useCase.execute("", "user1", "moderation")).rejects.toThrow(ValidationError);
      await expect(useCase.execute("g1", "", "moderation")).rejects.toThrow(ValidationError);
      await expect(useCase.execute("g1", "user1", "")).rejects.toThrow(ValidationError);
    });
  });

  describe("UpdateModuleConfig", () => {
    it("updates a single field", async () => {
      const port = makeMockModulePort();
      const useCase = new UpdateModuleConfig(port);

      const res = await useCase.execute("g1", "user1", "moderation", "logChannel", "456");
      expect(res).toBe(true);
      expect(port.setModuleConfig).toHaveBeenCalledWith("g1", "user1", "moderation", "logChannel", "456");
    });

    it("updates multiple fields", async () => {
      const port = makeMockModulePort();
      const useCase = new UpdateModuleConfig(port);

      const res = await useCase.execute("g1", "user1", "moderation", { logChannel: "789", enabled: true });
      expect(res).toEqual({ logChannel: "789", enabled: true });
      expect(port.setModuleConfigMany).toHaveBeenCalledWith("g1", "user1", "moderation", {
        logChannel: "789",
        enabled: true,
      });
    });

    it("throws ValidationError when no key or values provided", async () => {
      const port = makeMockModulePort();
      const useCase = new UpdateModuleConfig(port);

      await expect(
        useCase.execute({ guildId: "g1", actorId: "user1", moduleName: "moderation" }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("ToggleModule", () => {
    it("toggles module enabled state", async () => {
      const port = makeMockModulePort();
      const useCase = new ToggleModule(port);

      const res = await useCase.execute("g1", "user1", "moderation", false);
      expect(res).toBe(true);
      expect(port.setModuleEnabled).toHaveBeenCalledWith("g1", "user1", "moderation", false);
    });

    it("validates required inputs", async () => {
      const port = makeMockModulePort();
      const useCase = new ToggleModule(port);

      await expect(useCase.execute("", "user1", "moderation", true)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
