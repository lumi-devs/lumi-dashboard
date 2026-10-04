"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Guild } from "#/domain/guild/Guild";
import type { Viewer } from "#/domain/auth/User";
import type { Capability } from "#/domain/permissions/Capability";

export interface GuildContextValue {
  guild: Guild;
  viewer: Viewer;
  capabilities: Set<Capability>;
  hasCapability: (cap: Capability) => boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export const GuildContext = createContext<GuildContextValue | null>(null);

export interface GuildProviderProps {
  guild: Guild;
  viewer: Viewer;
  capabilities?: Set<Capability> | Iterable<Capability>;
  isOwner?: boolean;
  isAdmin?: boolean;
  hasCapability?: (cap: Capability) => boolean;
  children: ReactNode;
}

export function GuildProvider({
  guild,
  viewer,
  capabilities,
  isOwner,
  isAdmin,
  hasCapability: customHasCapability,
  children,
}: GuildProviderProps) {
  const value = useMemo<GuildContextValue>(() => {
    const resolvedIsOwner =
      isOwner ??
      Boolean(
        viewer.isBotOwner ||
        viewer.isOwner ||
        (guild.ownerId && guild.ownerId === viewer.id),
      );

    const resolvedIsAdmin = isAdmin ?? resolvedIsOwner;

    const capSet: Set<Capability> =
      capabilities instanceof Set
        ? capabilities
        : new Set(capabilities ?? []);

    const hasCap = (cap: Capability): boolean => {
      if (customHasCapability) {
        return customHasCapability(cap);
      }
      if (resolvedIsOwner) return true;
      if (resolvedIsAdmin && !cap.startsWith("owner.")) return true;
      return capSet.has(cap);
    };

    return {
      guild,
      viewer,
      capabilities: capSet,
      hasCapability: hasCap,
      isOwner: resolvedIsOwner,
      isAdmin: resolvedIsAdmin,
    };
  }, [guild, viewer, capabilities, isOwner, isAdmin, customHasCapability]);

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}

export function useGuildContext(): GuildContextValue {
  const context = useContext(GuildContext);
  if (!context) {
    throw new Error("useGuildContext must be used within a GuildProvider");
  }
  return context;
}
