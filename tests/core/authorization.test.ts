import { describe, expect, it } from "bun:test";
import { authorize } from "#/core/authorization/authorize";
import { ownerPolicy } from "#/core/authorization/policies/owner-policy";
import { adminPolicy } from "#/core/authorization/policies/admin-policy";
import { permitPolicy } from "#/core/authorization/policies/permit-policy";
import type { Viewer } from "#/domain/auth/User";
import type { GuildContextValue } from "#/core/guild/GuildContext";
import type { Guild } from "#/domain/guild/Guild";

describe("Authorization and Policies", () => {
  const mockGuild: Guild = {
    id: "g1",
    name: "Test Guild",
    icon: null,
    banner: null,
    ownerId: "u-owner",
    memberCount: 10,
    settings: { prefix: "!", locale: "en" },
  };

  const regularUser: Viewer = {
    id: "u-user",
    username: "regular",
    isOwner: false,
    isBotOwner: false,
  };

  const botOwner: Viewer = {
    id: "u-botowner",
    username: "botowner",
    isOwner: false,
    isBotOwner: true,
  };

  const guildOwnerViewer: Viewer = {
    id: "u-owner",
    username: "guildowner",
    isOwner: true,
    isBotOwner: false,
  };

  const createGuildContext = (overrides?: Partial<GuildContextValue>): GuildContextValue => {
    const caps = overrides?.capabilities ?? new Set();
    return {
      guild: mockGuild,
      viewer: regularUser,
      capabilities: caps,
      hasCapability: (cap) => caps.has(cap),
      isOwner: false,
      isAdmin: false,
      ...overrides,
    };
  };

  describe("ownerPolicy", () => {
    it("allows bot owners for any action", () => {
      const result = ownerPolicy.evaluate({
        viewer: botOwner,
        action: "owner.serverlock",
      });
      expect(result).toBe(true);
    });

    it("allows guild owners for any action", () => {
      const ctx = createGuildContext({ isOwner: true, viewer: guildOwnerViewer });
      const result = ownerPolicy.evaluate({
        viewer: guildOwnerViewer,
        action: "owner.leave",
        guildContext: ctx,
      });
      expect(result).toBe(true);
    });

    it("denies owner.* actions for non-owners", () => {
      const ctx = createGuildContext({ isOwner: false, isAdmin: true });
      const result = ownerPolicy.evaluate({
        viewer: regularUser,
        action: "owner.serverlock",
        guildContext: ctx,
      });
      expect(result).toBe(false);
    });

    it("returns undefined for non-owner actions by non-owners", () => {
      const ctx = createGuildContext({ isOwner: false });
      const result = ownerPolicy.evaluate({
        viewer: regularUser,
        action: "mod.ban",
        guildContext: ctx,
      });
      expect(result).toBeUndefined();
    });
  });

  describe("adminPolicy", () => {
    it("allows non-owner actions for admins", () => {
      const ctx = createGuildContext({ isAdmin: true });
      const result = adminPolicy.evaluate({
        viewer: regularUser,
        action: "moderation.view",
        guildContext: ctx,
      });
      expect(result).toBe(true);
    });

    it("denies owner.* actions for non-owner admins", () => {
      const ctx = createGuildContext({ isAdmin: true, isOwner: false });
      const result = adminPolicy.evaluate({
        viewer: regularUser,
        action: "owner.leave",
        guildContext: ctx,
      });
      expect(result).toBe(false);
    });

    it("returns undefined for non-admins", () => {
      const ctx = createGuildContext({ isAdmin: false });
      const result = adminPolicy.evaluate({
        viewer: regularUser,
        action: "moderation.view",
        guildContext: ctx,
      });
      expect(result).toBeUndefined();
    });
  });

  describe("permitPolicy", () => {
    it("allows action if capability is present in guild context", () => {
      const ctx = createGuildContext({
        capabilities: new Set(["moderation.view"]),
      });
      const result = permitPolicy.evaluate({
        viewer: regularUser,
        action: "moderation.view",
        guildContext: ctx,
      });
      expect(result).toBe(true);
    });

    it("returns undefined if capability is absent", () => {
      const ctx = createGuildContext({
        capabilities: new Set(),
      });
      const result = permitPolicy.evaluate({
        viewer: regularUser,
        action: "moderation.view",
        guildContext: ctx,
      });
      expect(result).toBeUndefined();
    });
  });

  describe("authorize()", () => {
    it("authorizes bot owner unconditionally", () => {
      expect(authorize(botOwner, "owner.announce")).toBe(true);
      expect(authorize(botOwner, "guild.view")).toBe(true);
    });

    it("authorizes guild owner with guild context", () => {
      const ctx = createGuildContext({ isOwner: true, viewer: guildOwnerViewer });
      expect(authorize(guildOwnerViewer, "owner.announce", ctx)).toBe(true);
      expect(authorize(guildOwnerViewer, "mod.ban", ctx)).toBe(true);
    });

    it("authorizes admin for regular capabilities but not owner.*", () => {
      const ctx = createGuildContext({ isAdmin: true, isOwner: false });
      expect(authorize(regularUser, "moderation.view", ctx)).toBe(true);
      expect(authorize(regularUser, "owner.leave", ctx)).toBe(false);
    });

    it("authorizes user with specific permit/capability", () => {
      const ctx = createGuildContext({
        isAdmin: false,
        capabilities: new Set(["moderation.view"]),
      });
      expect(authorize(regularUser, "moderation.view", ctx)).toBe(true);
      expect(authorize(regularUser, "moderation.update", ctx)).toBe(false);
    });

    it("denies unauthorized actions by default", () => {
      const ctx = createGuildContext({
        isAdmin: false,
        capabilities: new Set(),
      });
      expect(authorize(regularUser, "admin.manage", ctx)).toBe(false);
      expect(authorize(regularUser, "mod.manage")).toBe(false);
    });

    it("supports custom policies", () => {
      const customPolicy = {
        name: "custom-allow-all",
        evaluate: () => true,
      };
      expect(authorize(regularUser, "any.action", undefined, [customPolicy])).toBe(true);
    });
  });
});
