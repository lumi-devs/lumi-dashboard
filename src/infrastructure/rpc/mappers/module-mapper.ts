import type {
  DashboardModuleSummaryView,
  DashboardModuleView,
} from "@lumi/contracts/views";
import type { Module, ModuleSummary } from "#/domain/modules/Module";

export function toModuleSummary(dto: DashboardModuleSummaryView): ModuleSummary {
  return {
    id: dto.name,
    name: dto.name,
    displayName: dto.displayName,
    emoji: dto.emoji,
    description: dto.description,
    short: dto.short,
    version: dto.version,
    category: dto.category,
    enabled: dto.enabled,
    isAddon: dto.isAddon,
    conflicts: [...dto.conflicts],
    dependencies: [...dto.dependencies],
    configFields: [...dto.configFields],
    dashboardHref: dto.dashboardHref,
  };
}

export function toModule(dto: DashboardModuleView): Module {
  return {
    ...toModuleSummary(dto),
    config: { ...dto.config },
  };
}
