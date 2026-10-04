import { Settings } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const guildConfigModule = defineDashboardModule({
  id: "guild-config",
  name: "Guild Configuration",
  description: "General settings, ignored channels, backups, and permit management.",
  icon: Settings,
  category: "utility",
  capabilities: ["admin.config"],
  navigation: [
    {
      section: "Configuration",
      title: "General",
      href: "/config/general",
      icon: Settings,
      requiredCapabilities: ["admin.config"],
    },
  ],
});
