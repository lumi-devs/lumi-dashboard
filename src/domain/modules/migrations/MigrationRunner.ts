/**
 * Client/Domain-level Module Schema Migration Runner.
 *
 * Enables seamless upgrading of stored module config objects across schema
 * version bumps without breaking backwards compatibility with previously stored configurations.
 */

export type MigrationFn<TBefore = Record<string, unknown>, TAfter = Record<string, unknown>> = (
  config: TBefore,
) => TAfter | Promise<TAfter>;

export interface ModuleMigration {
  fromVersion: number;
  toVersion: number;
  migrate: MigrationFn;
}

export interface VersionedConfig<T = Record<string, unknown>> {
  schemaVersion: number;
  data: T;
}

export class MigrationRunner {
  private readonly migrations = new Map<string, ModuleMigration[]>();

  public register(moduleId: string, migration: ModuleMigration): void {
    const list = this.migrations.get(moduleId) ?? [];
    list.push(migration);
    // Sort ascending by source version
    list.sort((a, b) => a.fromVersion - b.fromVersion);
    this.migrations.set(moduleId, list);
  }

  public async run<T = Record<string, unknown>>(
    moduleId: string,
    currentVersion: number,
    targetVersion: number,
    data: Record<string, unknown>,
  ): Promise<T> {
    if (currentVersion === targetVersion) {
      return data as T;
    }

    if (currentVersion > targetVersion) {
      throw new Error(
        `Cannot downgrade config for module "${moduleId}" from version ${currentVersion} to ${targetVersion}`,
      );
    }

    const available = this.migrations.get(moduleId) ?? [];
    let state = { ...data };
    let v = currentVersion;

    while (v < targetVersion) {
      const step = available.find((m) => m.fromVersion === v);
      if (!step) {
        throw new Error(
          `Missing schema migration path for module "${moduleId}" from version ${v} to ${targetVersion}`,
        );
      }
      state = await step.migrate(state);
      v = step.toVersion;
    }

    return state as T;
  }
}

export const migrationRunner = new MigrationRunner();
