import { Moon } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const afkModule = defineDashboardModule({
  id: "afk",
  name: "AFK",
  description: "Status and list of away server members.",
  icon: Moon,
  category: "utility",
  capabilities: ["admin.config"],
  navigation: [
    {
      section: "Configuration",
      title: "Advanced",
      href: "/config/advanced",
      icon: Moon,
      requiredCapabilities: ["admin.config"],
    },
  ],
});
