import "server-only";
import { rpc, RpcError, isGuildMissing } from "#/lib/rpc";
import type { GuildPort } from "#/ports/GuildPort";
import type {
  Guild,
  GuildOverview,
  GuildSummary,
  GuildChannel,
  GuildRole,
  GuildMemberSample,
  GuildSettings,
} from "#/domain/guild/Guild";
import {
  toGuild,
  toGuildSummary,
  toGuildRole,
  toGuildChannel,
  toGuildMemberSample,
  toGuildSettings,
} from "../mappers/guild-mapper";
import {
  GuildNotFoundError,
  RpcCommunicationError,
} from "#/core/errors/AppError";

function handleRpcError(error: unknown, guildId: string): never {
  if (isGuildMissing(error)) {
    throw new GuildNotFoundError(guildId);
  }
  if (error instanceof RpcError) {
    throw new RpcCommunicationError(error.message, {
      code: error.code,
      action: error.action,
      retryable: error.retryable,
      guildId,
    });
  }
  throw error;
}

export class RpcGuildRepository implements GuildPort {
  async getGuild(guildId: string, actorId: string): Promise<Guild> {
    try {
      const shell = await rpc("guild.shell.get", { guildId, actorId });
      return toGuild(guildId, shell);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async getGuildOverview(guildId: string, actorId: string): Promise<GuildOverview> {
    try {
      const [shell, entities, panic] = await Promise.all([
        rpc("guild.shell.get", { guildId, actorId }),
        rpc("guild.entities.get", { guildId, actorId }),
        rpc("guild.panic.get", { guildId, actorId }),
      ]);

      const enabledModulesCount = shell.modules.filter(
        (m) => m.enabled || m.name === "core",
      ).length;

      return {
        id: guildId,
        name: shell.name,
        icon: shell.icon,
        banner: shell.banner,
        memberCount: shell.memberCount,
        rolesCount: entities.roles.length,
        channelsCount: entities.channels.length,
        modulesEnabledCount: enabledModulesCount,
        panicActive: panic.active,
      };
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async listGuildSummaries(guildIds: string[], actorId: string): Promise<GuildSummary[]> {
    if (guildIds.length === 0) return [];
    try {
      const res = await rpc("guild.summaries.list", {
        actorId,
        data: { guildIds },
      });
      return res.summaries.map(toGuildSummary);
    } catch (err) {
      if (err instanceof RpcError) {
        throw new RpcCommunicationError(err.message, {
          code: err.code,
          action: err.action,
          retryable: err.retryable,
        });
      }
      throw err;
    }
  }

  async getChannels(guildId: string, actorId: string): Promise<GuildChannel[]> {
    try {
      const entities = await rpc("guild.entities.get", { guildId, actorId });
      return entities.channels.map(toGuildChannel);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async getRoles(guildId: string, actorId: string): Promise<GuildRole[]> {
    try {
      const entities = await rpc("guild.entities.get", { guildId, actorId });
      return entities.roles.map(toGuildRole);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async getMembersSample(guildId: string, actorId: string): Promise<GuildMemberSample[]> {
    try {
      const entities = await rpc("guild.entities.get", { guildId, actorId });
      return entities.members.map(toGuildMemberSample);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }

  async updateSettings(
    guildId: string,
    actorId: string,
    settings: { prefix?: string | null; locale?: "en-US" },
  ): Promise<GuildSettings> {
    try {
      const res = await rpc("guild.settings.set", {
        guildId,
        actorId,
        data: settings,
      });
      return toGuildSettings(res.settings);
    } catch (err) {
      handleRpcError(err, guildId);
    }
  }
}
