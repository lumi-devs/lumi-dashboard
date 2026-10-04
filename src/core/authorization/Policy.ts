import type { Viewer } from "#/domain/auth/User";
import type { Capability } from "#/domain/permissions/Capability";
import type { GuildContextValue } from "#/core/guild/GuildContext";

export interface PolicyEvaluationContext {
  viewer: Viewer;
  action: Capability | string;
  guildContext?: GuildContextValue;
}

export type PolicyResult = boolean | undefined;

export interface Policy {
  name: string;
  evaluate(context: PolicyEvaluationContext): PolicyResult;
}

export function evaluatePolicies(
  policies: readonly Policy[],
  context: PolicyEvaluationContext,
): boolean {
  for (const policy of policies) {
    const result = policy.evaluate(context);
    if (result !== undefined) {
      return result;
    }
  }
  return false;
}
