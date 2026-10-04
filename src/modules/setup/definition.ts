import { Sparkles } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const setupModule = defineDashboardModule({
  id: "setup",
  name: "Setup Wizard",
  description: "Guided server onboarding and first-time configuration.",
  icon: Sparkles,
  category: "utility",
  capabilities: ["admin.config"],
  navigation: [
    {
      section: "Server",
      title: "Setup",
      href: "/setup",
      icon: Sparkles,
      requiredCapabilities: ["admin.config"],
    },
  ],
});
