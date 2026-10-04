import type { Capability } from "#/domain/permissions/Capability";
import type { Policy, PolicyEvaluationContext, PolicyResult } from "../Policy";

export const permitPolicy: Policy = {
  name: "permit-policy",
  evaluate({ action, guildContext }: PolicyEvaluationContext): PolicyResult {
    if (!guildContext) {
      return undefined;
    }

    const cap: Capability = action;
    if (guildContext.hasCapability(cap) || guildContext.capabilities.has(cap)) {
      return true;
    }

    return undefined;
  },
};
