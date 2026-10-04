import type { Viewer } from "#/domain/auth/User";
import type { Capability } from "#/domain/permissions/Capability";
import type { GuildContextValue } from "#/core/guild/GuildContext";
import { evaluatePolicies, type Policy } from "./Policy";
import { defaultPolicies } from "./policies";

export function authorize(
  viewer: Viewer,
  action: Capability | string,
  guildContext?: GuildContextValue,
  policies: readonly Policy[] = defaultPolicies,
): boolean {
  return evaluatePolicies(policies, {
    viewer,
    action,
    guildContext,
  });
}
