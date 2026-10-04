import { ShieldAlert, SlidersHorizontal } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const securityModule = defineDashboardModule({
  id: "security",
  name: "Security",
  description: "Anti-nuke protection, panic lockdown mode, and configuration overrides.",
  icon: ShieldAlert,
  category: "security",
  capabilities: ["security.manage"],
  navigation: [
    {
      section: "Safety & Security",
      title: "Panic & Verification",
      href: "/security",
      icon: ShieldAlert,
      requiredCapabilities: ["security.manage"],
    },
    {
      section: "Safety & Security",
      title: "Overrides",
      href: "/security/overrides",
      icon: SlidersHorizontal,
      requiredCapabilities: ["security.manage"],
    },
  ],
});
