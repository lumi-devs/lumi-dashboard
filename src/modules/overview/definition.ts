import { LayoutDashboard } from "lucide-react";
import { defineDashboardModule } from "#/domain/modules/DashboardModule";

export const overviewModule = defineDashboardModule({
  id: "overview",
  name: "Overview",
  description: "Server dashboard overview, health checks, and recent audit activity.",
  icon: LayoutDashboard,
  category: "utility",
  capabilities: [],
  navigation: [
    {
      section: "Server",
      title: "Overview",
      href: "",
      icon: LayoutDashboard,
    },
  ],
});
