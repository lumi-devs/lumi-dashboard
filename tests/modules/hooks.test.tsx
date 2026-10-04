import { describe, expect, it, vi } from "bun:test";
import { renderHook, waitFor, act } from "@testing-library/react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useModuleConfig } from "#/modules/hooks/useModuleConfig";
import { useUpdateModuleConfig } from "#/modules/hooks/useUpdateModuleConfig";
import { guildActionsMock } from "../setup";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("Module Hooks", () => {
  describe("useModuleConfig", () => {
    it("uses initialConfig without loading if provided", () => {
      const { result } = renderHook(
        () => useModuleConfig("g1", "moderation", { logChannel: "123" }),
        { wrapper: createWrapper() },
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.config).toEqual({ logChannel: "123" });
      expect(result.current.error).toBeNull();
    });

    it("fetches config when initialConfig is not provided", async () => {
      guildActionsMock.getGuildModuleConfig.mockResolvedValueOnce({
        ok: true,
        config: { dmOnAction: true },
      });

      const { result } = renderHook(() => useModuleConfig("g1", "moderation"), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.config).toEqual({ dmOnAction: true });
    });

    it("handles fetch failure", async () => {
      guildActionsMock.getGuildModuleConfig.mockResolvedValueOnce({
        ok: false,
        error: "Module disabled",
      });

      const { result } = renderHook(() => useModuleConfig("g1", "moderation"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useUpdateModuleConfig", () => {
    it("updates multiple config fields successfully", async () => {
      guildActionsMock.setManyGuildConfigFields.mockResolvedValueOnce({
        ok: true,
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(
        () =>
          useUpdateModuleConfig({
            guildId: "g1",
            moduleName: "moderation",
            onSuccess,
          }),
        { wrapper: createWrapper() },
      );

      const success = await result.current.updateConfig({ logChannel: "456" });

      expect(success).toBe(true);
      expect(guildActionsMock.setManyGuildConfigFields).toHaveBeenCalledWith(
        "g1",
        "moderation",
        { logChannel: "456" },
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it("updates single config field successfully", async () => {
      guildActionsMock.setGuildConfigField.mockResolvedValueOnce({
        ok: true,
      });

      const { result } = renderHook(
        () =>
          useUpdateModuleConfig({
            guildId: "g1",
            moduleName: "moderation",
          }),
        { wrapper: createWrapper() },
      );

      const success = await result.current.updateField("logChannel", "789");

      expect(success).toBe(true);
      expect(guildActionsMock.setGuildConfigField).toHaveBeenCalledWith(
        "g1",
        "moderation",
        "logChannel",
        "789",
      );
    });

    it("handles mutation failure and sets error", async () => {
      guildActionsMock.setGuildConfigField.mockResolvedValueOnce({
        ok: false,
        error: "Permission denied to update field",
      });

      const onError = vi.fn();
      const { result } = renderHook(
        () =>
          useUpdateModuleConfig({
            guildId: "g1",
            moduleName: "moderation",
            onError,
          }),
        { wrapper: createWrapper() },
      );

      let success: boolean = true;
      await act(async () => {
        success = await result.current.updateField("logChannel", "789");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe("Permission denied to update field");
      expect(onError).toHaveBeenCalledWith("Permission denied to update field");
    });
  });
});
