import type { ConfigField } from "@lumi/contracts";

export interface ModuleMetadata {
  id: string;
  name: string;
  displayName: string;
  emoji: string;
  description: string;
  short?: string;
  version: string;
  category: string;
  isAddon: boolean;
  conflicts: string[];
  dependencies: string[];
  configFields: ConfigField[];
  dashboardHref: string | null;
}

export interface ModuleStatus {
  name: string;
  enabled: boolean;
}

export interface ModuleSummary extends ModuleMetadata {
  enabled: boolean;
}

export interface Module extends ModuleSummary {
  config: Record<string, unknown>;
}

export interface ConfigOverride {
  moduleName: string;
  key: string;
  modelType: "channel" | "role" | "user" | "category";
  modelId: string;
  value: unknown;
}
