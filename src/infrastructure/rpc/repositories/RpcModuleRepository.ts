import "server-only";
import { rpc, RpcError, isGuildMissing } from "#/lib/rpc";
import type { ModulePort } from "#/ports/ModulePort";
import type { Module, ModuleSummary } from "#/domain/modules/Module";
import { toModule, toModuleSummary } from "../mappers/module-mapper";
import {
  GuildNotFoundError,
  ModuleUnavailableError,
  RpcCommunicationError,
} from "#/core/errors/AppError";

function handleRpcError(error: unknown, guildId: string, moduleName?: string): never {
  if (isGuildMissing(error)) {
    throw new GuildNotFoundError(guildId);
  }
  if (error instanceof RpcError) {
    if (error.code === "MODULE_NOT_LOADED" && moduleName) {
      throw new ModuleUnavailableError(moduleName, error.message);
    }
    throw new RpcCommunicationError(error.message, {
      code: error.code,
      action: error.action,
      retryable: error.retryable,
      guildId,
      moduleName,
    });
  }
  throw error;
}

export class RpcModuleRepository implements ModulePort {
  async getModules(guildId: string, actorId: string): Promise<ModuleSummary[]> {
    try {
      const shell = await rpc("guild.shell.get", { guildId, actorId });
      return shell.modules.map(toModuleSummary);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async getModule(
    guildId: string,
    actorId: string,
    moduleName: string,
  ): Promise<Module | null> {
    try {
      const res = await rpc("guild.module.get", {
        guildId,
        actorId,
        data: { module: moduleName },
      });
      if (!res.module) return null;
      return toModule(res.module);
    } catch (err) {
      handleRpcError(err, guildId, moduleName);
    }
  }

  async setModuleEnabled(
    guildId: string,
    actorId: string,
    moduleName: string,
    enabled: boolean,
  ): Promise<boolean> {
    try {
      const res = await rpc("guild.module.toggle", {
        guildId,
        actorId,
        data: { moduleName, enabled },
      });
      return res.success;
    } catch (err) {
      handleRpcError(err, guildId, moduleName);
    }
  }

  async setModuleConfig(
    guildId: string,
    actorId: string,
    moduleName: string,
    key: string,
    value: unknown,
  ): Promise<boolean> {
    try {
      const res = await rpc("guild.config.set", {
        guildId,
        actorId,
        data: { moduleName, key, value },
      });
      return res.success;
    } catch (err) {
      handleRpcError(err, guildId, moduleName);
    }
  }

  async setModuleConfigMany(
    guildId: string,
    actorId: string,
    moduleName: string,
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    try {
      const res = await rpc("guild.config.setMany", {
        guildId,
        actorId,
        data: { moduleName, values },
      });
      return res.updated;
    } catch (err) {
      handleRpcError(err, guildId, moduleName);
    }
  }
}
