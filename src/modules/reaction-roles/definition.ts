import { Ticket } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const reactionRolesModule = defineDashboardModule({
  id: "reaction-roles",
  name: "Reaction Roles",
  description: "Self-serve role menus with buttons, dropdowns, or reaction prompts.",
  icon: Ticket,
  category: "engagement",
  capabilities: ["reactionroles.manage"],
  navigation: [
    {
      section: "Community & Engagement",
      title: "Reaction Roles",
      href: "/config/roles",
      icon: Ticket,
      requiredCapabilities: ["reactionroles.manage"],
    },
  ],
});
