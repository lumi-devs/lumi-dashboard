import "server-only";
import { RpcClient } from "@lumi/contracts/rpc/client";
import type { RpcActionName, RpcInput, RpcOutput } from "@lumi/contracts/rpc";
import { injectTraceContext } from "@lumi/observability";
import { env } from "./env";

export { RpcError, isContractMismatch, isGuildMissing } from "@lumi/contracts/rpc/client";
export type { RpcClient } from "@lumi/contracts/rpc/client";

// `Parameters<RpcClient["invoke"]>[1]` erases the generic (a generic
// method's extracted parameter type collapses to the union over every
// action), so `data` would stop narrowing per-action for every call site.
// Mirroring `RpcClient`'s own internal `CallOptions` shape keeps the
// per-action narrowing `rpc()`'s callers rely on.
type CallOptions<A extends RpcActionName> = {
  guildId?: string;
  actorId?: string;
} & (RpcInput<A> extends undefined ? { data?: undefined } : { data: RpcInput<A> });

// Next.js has no long-lived bootstrap to wire this up in — handlers, Server
// Components and Server Actions are all invoked ad hoc — so the client is a
// lazy module-scope singleton. `globalThis` keeps `next dev` hot-reloads from
// constructing a fresh one each time.
const globalForRpc = globalThis as unknown as { rpcClient?: RpcClient };

export function getRpcClient(): RpcClient {
  if (!globalForRpc.rpcClient) {
    globalForRpc.rpcClient = new RpcClient({
      baseUrl: env.rpcHttpUrl,
      token: env.rpcInternalToken,
      logger: (msg) => {
        if (msg.includes("Contract version mismatch") || msg.includes("malformed")) {
          console.error(msg);
        } else if (env.isDevelopment) {
          console.debug(msg);
        }
      },
      injectTraceHeaders: () => injectTraceContext(),
      // Only ever applied to the router's readOnly actions, so this only
      // ever retries reads (e.g. through guild-reads.ts) — mutations are
      // never retried regardless.
      retry: { attempts: 2, baseDelayMs: 150 },
    });
  }
  return globalForRpc.rpcClient;
}

export function rpc<A extends RpcActionName>(
  action: A,
  options: CallOptions<A>,
): Promise<RpcOutput<A>> {
  return getRpcClient().invoke(action, options);
}
