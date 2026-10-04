import type { Policy, PolicyEvaluationContext, PolicyResult } from "../Policy";

export const adminPolicy: Policy = {
  name: "admin-policy",
  evaluate({ action, guildContext }: PolicyEvaluationContext): PolicyResult {
    if (!guildContext?.isAdmin) {
      return undefined;
    }

    if (action.startsWith("owner.")) {
      return false;
    }

    return true;
  },
};
