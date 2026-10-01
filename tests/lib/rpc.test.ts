import { describe, it, expect, vi, beforeEach, mock } from "bun:test";

// The actual RPC wire protocol, envelope parsing and retry/breaker behaviour
// now live in `@lumi/contracts/rpc/client`'s own `RpcClient`, covered by that
// package's own `rpc/client.test.ts` upstream. This file only exercises
// `#/lib/rpc`'s own wiring: that `getRpcClient()` builds a singleton
// `RpcClient` from `env`, and that `rpc()` delegates to it.
const invoke = vi.fn().mockResolvedValue({ ok: true });
const ctorArgs: unknown[] = [];

class FakeRpcClient {
  public constructor(options: unknown) {
    ctorArgs.push(options);
  }
  public invoke = invoke;
}

mock.module("@lumi/contracts/rpc/client", () => ({
  RpcClient: FakeRpcClient,
}));

mock.module("server-only", () => ({}));

describe("#/lib/rpc wiring", () => {
  beforeEach(() => {
    invoke.mockClear();
    ctorArgs.length = 0;
    delete (globalThis as { rpcClient?: unknown }).rpcClient;
  });

  it("getRpcClient() builds a singleton RpcClient from env", async () => {
    const { getRpcClient } = await import("#/lib/rpc");
    const first = getRpcClient();
    const second = getRpcClient();

    expect(first).toBe(second);
    expect(ctorArgs).toHaveLength(1);
    expect(ctorArgs[0]).toMatchObject({
      baseUrl: expect.any(String),
      retry: { attempts: 2, baseDelayMs: 150 },
    });
  });

  it("rpc() delegates to the singleton client's invoke()", async () => {
    const { rpc } = await import("#/lib/rpc");
    await rpc("guild.shell.get", { guildId: "101", actorId: "1" });

    expect(invoke).toHaveBeenCalledWith("guild.shell.get", {
      guildId: "101",
      actorId: "1",
    });
  });
});
