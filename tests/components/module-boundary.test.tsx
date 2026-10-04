import { describe, expect, it, vi } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModuleBoundary } from "#/components/layout/ModuleBoundary";
import { GuildProvider } from "#/core/guild/GuildContext";
import type { DashboardModule } from "#/domain/modules/DashboardModule";
import { registerModule as registerToRegistry } from "#/modules/registry";
import {
  ModuleUnavailableError,
  PermissionDeniedError,
} from "#/core/errors/AppError";
import type { Guild } from "#/domain/guild/Guild";
import type { Viewer } from "#/domain/auth/User";

const mockGuild: Guild = {
  id: "guild-1",
  name: "Test Guild",
  icon: null,
  banner: null,
  memberCount: 10,
  settings: { prefix: "!", locale: "en-US" },
};

const mockViewer: Viewer = {
  id: "user-1",
  username: "testuser",
  globalName: "Test User",
  avatar: null,
  isOwner: false,
  isBotOwner: false,
};

describe("ModuleBoundary", () => {
  it("renders children when available and no errors or loading", () => {
    render(
      <ModuleBoundary>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.getByText("Module Content")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(
      <ModuleBoundary isLoading>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.queryByText("Module Content")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders custom fallback when isLoading is true and fallback is provided", () => {
    render(
      <ModuleBoundary isLoading fallback={<div>Custom Loading...</div>}>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.getByText("Custom Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Module Content")).not.toBeInTheDocument();
  });

  it("renders error alert with retry button on generic error", () => {
    const onRetry = vi.fn();
    render(
      <ModuleBoundary error={new Error("Network failed")} onRetry={onRetry}>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.getByText("Failed to load module")).toBeInTheDocument();
    expect(screen.getByText("Network failed")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders not enabled alert when error is ModuleUnavailableError", () => {
    render(
      <ModuleBoundary error={new ModuleUnavailableError("music")}>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.getByText(/is not enabled/i)).toBeInTheDocument();
    expect(screen.queryByText("Module Content")).not.toBeInTheDocument();
  });

  it("renders permission denied alert when error is PermissionDeniedError", () => {
    render(
      <ModuleBoundary error={new PermissionDeniedError()}>
        <div>Module Content</div>
      </ModuleBoundary>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.queryByText("Module Content")).not.toBeInTheDocument();
  });

  it("renders permission denied alert when viewer lacks required capability", () => {
    render(
      <GuildProvider
        guild={mockGuild}
        viewer={mockViewer}
        capabilities={new Set(["guild.view"])}
        isOwner={false}
        isAdmin={false}
      >
        <ModuleBoundary capability="admin.config">
          <div>Admin Only</div>
        </ModuleBoundary>
      </GuildProvider>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(screen.getByText(/admin.config/)).toBeInTheDocument();
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
  });

  it("renders children when viewer has required capability", () => {
    render(
      <GuildProvider
        guild={mockGuild}
        viewer={mockViewer}
        capabilities={new Set(["admin.config"])}
        isOwner={false}
        isAdmin={false}
      >
        <ModuleBoundary capability="admin.config">
          <div>Admin Only</div>
        </ModuleBoundary>
      </GuildProvider>,
    );

    expect(screen.getByText("Admin Only")).toBeInTheDocument();
    expect(screen.queryByText("Access Denied")).not.toBeInTheDocument();
  });

  it("renders disabled alert when module isAvailable returns false", () => {
    const unavailableModule: DashboardModule = {
      id: "disabled-mod",
      name: "Disabled Mod",
      description: "A disabled mod",
      icon: "Shield",
      category: "utility",
      capabilities: [],
      navigation: [],
      isAvailable: () => false,
    };
    registerToRegistry(unavailableModule);

    render(
      <GuildProvider
        guild={mockGuild}
        viewer={mockViewer}
        isOwner={false}
        isAdmin={false}
      >
        <ModuleBoundary moduleId="disabled-mod">
          <div>Disabled Content</div>
        </ModuleBoundary>
      </GuildProvider>,
    );

    expect(screen.getByText(/Disabled Mod is not enabled/i)).toBeInTheDocument();
    expect(screen.queryByText("Disabled Content")).not.toBeInTheDocument();
  });
});
