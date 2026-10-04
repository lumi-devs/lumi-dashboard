import { Volume2 } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const tempvcModule = defineDashboardModule({
  id: "tempvc",
  name: "Temporary Voice",
  description: "Dynamic temporary voice channels created on demand when members join a generator.",
  icon: Volume2,
  category: "utility",
  capabilities: ["admin.config"],
  navigation: [
    {
      section: "Configuration",
      title: "Voice Generators",
      href: "/config/voice",
      icon: Volume2,
      requiredCapabilities: ["admin.config"],
    },
  ],
});
