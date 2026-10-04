import { ShieldCheck } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const verificationModule = defineDashboardModule({
  id: "verification",
  name: "Verification",
  description: "Gatekeeping and verification panel for new server members.",
  icon: ShieldCheck,
  category: "security",
  capabilities: ["security.manage"],
  navigation: [
    {
      section: "Safety & Security",
      title: "Panic & Verification",
      href: "/security",
      icon: ShieldCheck,
      requiredCapabilities: ["security.manage"],
    },
  ],
});
