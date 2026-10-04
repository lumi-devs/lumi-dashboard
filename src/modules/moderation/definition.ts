import { Gavel, TriangleAlert, Ban, StickyNote } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const moderationModule = defineDashboardModule({
  id: "moderation",
  name: "Moderation",
  description: "Moderation cases, warn thresholds, blocklist, and staff mod notes.",
  icon: Gavel,
  category: "moderation",
  capabilities: ["moderation.view"],
  navigation: [
    {
      section: "Discipline & Appeals",
      title: "Moderation Cases",
      href: "/moderation",
      icon: Gavel,
      requiredCapabilities: ["moderation.view"],
    },
    {
      section: "Discipline & Appeals",
      title: "Warn Thresholds",
      href: "/moderation/thresholds",
      icon: TriangleAlert,
      requiredCapabilities: ["moderation.view"],
    },
    {
      section: "Discipline & Appeals",
      title: "Blocklist",
      href: "/moderation/blocklist",
      icon: Ban,
      requiredCapabilities: ["moderation.view"],
    },
    {
      section: "Discipline & Appeals",
      title: "Mod Notes",
      href: "/moderation/notes",
      icon: StickyNote,
      requiredCapabilities: ["moderation.view"],
    },
  ],
});
