import type { Policy, PolicyEvaluationContext, PolicyResult } from "../Policy";

export const ownerPolicy: Policy = {
  name: "owner-policy",
  evaluate({ viewer, action, guildContext }: PolicyEvaluationContext): PolicyResult {
    if (viewer.isBotOwner) {
      return true;
    }

    const isGuildOwner =
      guildContext?.isOwner ||
      Boolean(guildContext?.guild?.ownerId && guildContext.guild.ownerId === viewer.id) ||
      viewer.isOwner;

    if (isGuildOwner) {
      return true;
    }

    if (action.startsWith("owner.")) {
      return false;
    }

    return undefined;
  },
};
