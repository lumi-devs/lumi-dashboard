"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getGuildModuleConfig } from "#/actions/guild-actions";

export interface UseModuleConfigOptions<T = Record<string, unknown>> {
  guildId: string;
  moduleName: string;
  initialConfig?: T;
  enabled?: boolean;
}

export interface UseModuleConfigResult<T = Record<string, unknown>> {
  config: T;
  isLoading: boolean;
  error: Error | string | null;
  refresh: () => Promise<void>;
  setConfig: React.Dispatch<React.SetStateAction<T>>;
}

export function useModuleConfig<T extends Record<string, unknown> = Record<string, unknown>>(
  guildIdOrOptions: string | UseModuleConfigOptions<T>,
  moduleNameArg?: string,
  initialConfigArg?: T,
): UseModuleConfigResult<T> {
  const options: UseModuleConfigOptions<T> =
    typeof guildIdOrOptions === "string"
      ? {
          guildId: guildIdOrOptions,
          moduleName: moduleNameArg!,
          initialConfig: initialConfigArg,
        }
      : guildIdOrOptions;

  const { guildId, moduleName, initialConfig, enabled = true } = options;
  const queryClient = useQueryClient();

  const [localOverrides, setLocalOverrides] = useState<T | null>(null);

  const queryKey = ["moduleConfig", guildId, moduleName];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      const res = await getGuildModuleConfig(guildId, moduleName);
      if (!res.ok) {
        throw new Error(res.error ?? "Failed to load module configuration");
      }
      return (res.config ?? {}) as T;
    },
    initialData: initialConfig,
    enabled: Boolean(guildId && moduleName && enabled),
  });

  const refresh = useCallback(async () => {
    setLocalOverrides(null);
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const effectiveConfig = (localOverrides ?? query.data ?? initialConfig ?? {}) as T;

  const setConfig: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      setLocalOverrides((prev) => {
        const current = (prev ?? query.data ?? initialConfig ?? {}) as T;
        return typeof action === "function" ? action(current) : action;
      });
    },
    [query.data, initialConfig],
  );

  return {
    config: effectiveConfig,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refresh,
    setConfig,
  };
}
