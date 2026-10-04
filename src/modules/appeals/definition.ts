import { Scale } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const appealsModule = defineDashboardModule({
  id: "appeals",
  name: "Appeals",
  description: "Review and manage member punishment appeals.",
  icon: Scale,
  category: "moderation",
  capabilities: ["moderation.view"],
  navigation: [
    {
      section: "Discipline & Appeals",
      title: "Appeals",
      href: "/appeals",
      icon: Scale,
      requiredCapabilities: ["moderation.view"],
    },
  ],
});
