"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  setGuildConfigField,
  setManyGuildConfigFields,
  type ActionResult,
} from "#/actions/guild-actions";

export interface UseUpdateModuleConfigOptions {
  guildId?: string;
  moduleName?: string;
  onSuccess?: (result?: ActionResult) => void;
  onError?: (error: string) => void;
}

export interface UpdateOverrides {
  guildId?: string;
  moduleName?: string;
}

export interface UseUpdateModuleConfigResult {
  updateConfig: (
    fields: Record<string, unknown>,
    overrides?: UpdateOverrides,
  ) => Promise<boolean>;
  updateField: (
    key: string,
    value: unknown,
    overrides?: UpdateOverrides,
  ) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
  resetError: () => void;
  setError: (error: string | null) => void;
}

export function useUpdateModuleConfig(
  options: UseUpdateModuleConfigOptions = {},
): UseUpdateModuleConfigResult {
  const { guildId: defaultGuildId, moduleName: defaultModuleName, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const mutation = useMutation({
    mutationFn: async (params: {
      guildId: string;
      moduleName: string;
      fields: Record<string, unknown>;
    }) => {
      const res = await setManyGuildConfigFields(
        params.guildId,
        params.moduleName,
        params.fields,
      );
      if (!res.ok) {
        throw new Error(res.error ?? "Failed to update configuration");
      }
      return res;
    },
    onSuccess: (res, vars) => {
      setError(null);
      void queryClient.invalidateQueries({
        queryKey: ["moduleConfig", vars.guildId, vars.moduleName],
      });
      onSuccess?.(res);
    },
    onError: (err: Error) => {
      const msg = err.message || "Failed to update configuration";
      setError(msg);
      onError?.(msg);
    },
  });

  const fieldMutation = useMutation({
    mutationFn: async (params: {
      guildId: string;
      moduleName: string;
      key: string;
      value: unknown;
    }) => {
      const res = await setGuildConfigField(
        params.guildId,
        params.moduleName,
        params.key,
        params.value,
      );
      if (!res.ok) {
        throw new Error(res.error ?? "Failed to update configuration");
      }
      return res;
    },
    onSuccess: (res, vars) => {
      setError(null);
      void queryClient.invalidateQueries({
        queryKey: ["moduleConfig", vars.guildId, vars.moduleName],
      });
      onSuccess?.(res);
    },
    onError: (err: Error) => {
      const msg = err.message || "Failed to update configuration";
      setError(msg);
      onError?.(msg);
    },
  });

  const updateConfig = useCallback(
    async (
      fields: Record<string, unknown>,
      overrides: UpdateOverrides = {},
    ): Promise<boolean> => {
      const targetGuildId = overrides.guildId ?? defaultGuildId;
      const targetModuleName = overrides.moduleName ?? defaultModuleName;

      if (!targetGuildId || !targetModuleName) {
        const msg = "Guild ID and Module Name are required to update configuration";
        setError(msg);
        onError?.(msg);
        return false;
      }

      try {
        await mutation.mutateAsync({
          guildId: targetGuildId,
          moduleName: targetModuleName,
          fields,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update configuration";
        setError(msg);
        return false;
      }
    },
    [defaultGuildId, defaultModuleName, mutation, onError],
  );

  const updateField = useCallback(
    async (
      key: string,
      value: unknown,
      overrides: UpdateOverrides = {},
    ): Promise<boolean> => {
      const targetGuildId = overrides.guildId ?? defaultGuildId;
      const targetModuleName = overrides.moduleName ?? defaultModuleName;

      if (!targetGuildId || !targetModuleName) {
        const msg = "Guild ID and Module Name are required to update configuration";
        setError(msg);
        onError?.(msg);
        return false;
      }

      try {
        await fieldMutation.mutateAsync({
          guildId: targetGuildId,
          moduleName: targetModuleName,
          key,
          value,
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update configuration";
        setError(msg);
        return false;
      }
    },
    [defaultGuildId, defaultModuleName, fieldMutation, onError],
  );

  return {
    updateConfig,
    updateField,
    isPending: mutation.isPending || fieldMutation.isPending,
    error,
    resetError,
    setError,
  };
}
