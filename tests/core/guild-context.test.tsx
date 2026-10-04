import { describe, expect, it } from "bun:test";
import { renderHook } from "@testing-library/react";
import React from "react";
import {
  GuildProvider,
  useGuildContext,
} from "#/core/guild/GuildContext";
import type { Guild } from "#/domain/guild/Guild";
import type { Viewer } from "#/domain/auth/User";

describe("GuildContext & GuildProvider", () => {
  const mockGuild: Guild = {
    id: "g123",
    name: "Lumi Test Guild",
    icon: null,
    banner: null,
    ownerId: "u-owner",
    memberCount: 50,
    settings: { prefix: "!", locale: "en" },
  };

  const mockViewer: Viewer = {
    id: "u-viewer",
    username: "testuser",
    isOwner: false,
    isBotOwner: false,
  };

  it("throws error when useGuildContext is called outside of GuildProvider", () => {
    expect(() => {
      renderHook(() => useGuildContext());
    }).toThrow("useGuildContext must be used within a GuildProvider");
  });

  it("provides guild, viewer, capabilities, and helper functions", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GuildProvider
        guild={mockGuild}
        viewer={mockViewer}
        capabilities={["moderation.view"]}
        isOwner={false}
        isAdmin={false}
      >
        {children}
      </GuildProvider>
    );

    const { result } = renderHook(() => useGuildContext(), { wrapper });

    expect(result.current.guild.id).toBe("g123");
    expect(result.current.viewer.id).toBe("u-viewer");
    expect(result.current.isOwner).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.hasCapability("moderation.view")).toBe(true);
    expect(result.current.hasCapability("admin.manage")).toBe(false);
  });

  it("resolves isOwner automatically when viewer id matches guild.ownerId", () => {
    const ownerViewer: Viewer = {
      ...mockViewer,
      id: "u-owner",
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GuildProvider guild={mockGuild} viewer={ownerViewer}>
        {children}
      </GuildProvider>
    );

    const { result } = renderHook(() => useGuildContext(), { wrapper });
    expect(result.current.isOwner).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    // Owner has all capabilities
    expect(result.current.hasCapability("mod.ban")).toBe(true);
  });

  it("admin has general capabilities but not owner.*", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GuildProvider
        guild={mockGuild}
        viewer={mockViewer}
        isAdmin={true}
        isOwner={false}
      >
        {children}
      </GuildProvider>
    );

    const { result } = renderHook(() => useGuildContext(), { wrapper });
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isOwner).toBe(false);
    expect(result.current.hasCapability("moderation.view")).toBe(true);
    expect(result.current.hasCapability("owner.leave")).toBe(false);
  });
});
