import { describe, it, expect } from "bun:test";
import { MigrationRunner } from "#/domain/modules/migrations/MigrationRunner";

describe("MigrationRunner", () => {
  it("returns unchanged data when source matches target version", async () => {
    const runner = new MigrationRunner();
    const result = await runner.run("test", 1, 1, { foo: "bar" });
    expect(result).toEqual({ foo: "bar" });
  });

  it("applies sequential migrations in order", async () => {
    const runner = new MigrationRunner();
    runner.register("test", {
      fromVersion: 1,
      toVersion: 2,
      migrate: (cfg: any) => ({ ...cfg, step1: true }),
    });
    runner.register("test", {
      fromVersion: 2,
      toVersion: 3,
      migrate: (cfg: any) => ({ ...cfg, step2: true, value: 42 }),
    });

    const result = await runner.run("test", 1, 3, { initial: "ok" });
    expect(result).toEqual({
      initial: "ok",
      step1: true,
      step2: true,
      value: 42,
    });
  });

  it("throws when a migration step is missing", async () => {
    const runner = new MigrationRunner();
    runner.register("test", {
      fromVersion: 1,
      toVersion: 2,
      migrate: (cfg: any) => cfg,
    });

    await expect(runner.run("test", 1, 3, {})).rejects.toThrow("Missing schema migration path");
  });

  it("throws when attempting to downgrade version", async () => {
    const runner = new MigrationRunner();
    await expect(runner.run("test", 2, 1, {})).rejects.toThrow("Cannot downgrade config");
  });
});
