"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, CircleSlash, Copy, Cpu, Network, Terminal } from "lucide-react";
import type { ClusterReplicaView, RpcOutput, ShardStateView } from "@lumi/contracts/rpc";
import { Alert } from "#/components/ui/alert";
import { Badge } from "#/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "#/components/ui/card";
import { EmptyState } from "#/components/ui/empty-state";
import { ProgressRing } from "#/components/ui/progress-ring";
import { Table, TableScroll, TBody, TD, TH, THead, TR } from "#/components/ui/table";
import { cn } from "#/lib/utils";
import { since } from "#/lib/log-format";
import { useStaggerIn } from "#/lib/animate";

export const HealthyStatus = "Ready";
export const OfflineStatuses = new Set(["Disconnected", "Idle"]);
const SlowPingMs = 500;

function statusVariant(status: string) {
  if (status === HealthyStatus) return "success" as const;
  if (OfflineStatuses.has(status)) return "danger" as const;
  return "warning" as const;
}

function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}

function shardRange(ids: number[]): string {
  if (ids.length === 0) return "none";
  const sorted = [...ids].sort((a, b) => a - b);
  const runs: string[] = [];
  let start = sorted[0]!;
  let prev = start;
  for (const id of sorted.slice(1)) {
    if (id === prev + 1) {
      prev = id;
      continue;
    }
    runs.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = id;
    prev = id;
  }
  runs.push(start === prev ? `${start}` : `${start}–${prev}`);
  return runs.join(", ");
}

function ShardLogConsole({
  shardId,
  logs,
}: {
  shardId: number;
  logs: Array<{ timestamp: string; level: string; message: string }>;
}) {
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState("");

  const filteredLogs = filter.trim()
    ? logs.filter(
        (l) =>
          l.message.toLowerCase().includes(filter.toLowerCase()) ||
          l.level.toLowerCase().includes(filter.toLowerCase()),
      )
    : logs;

  function copyLogs() {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join("\n");
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-control border border-border bg-[#050816] p-3 shadow-inner">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#1C2644] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-accent-secondary" />
          <span className="font-mono text-[13px] font-semibold text-fg">
            Shard {shardId} Console Output
          </span>
          <Badge variant="outline" className="text-[11px] font-mono">
            {logs.length} events
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter logs…"
            className="h-7 w-36 rounded-control border border-border bg-surface px-2 text-xs text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
          />
          <button
            type="button"
            onClick={copyLogs}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1 rounded-control border border-border bg-surface px-2 py-1 text-xs text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-50"
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto font-mono text-[12px] leading-relaxed">
        {filteredLogs.length === 0 ? (
          <p className="py-6 text-center text-fg-subtle">
            {logs.length === 0
              ? `Lumi is listening... no log output captured for Shard ${shardId} yet.`
              : "No logs matching filter."}
          </p>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 rounded px-1.5 py-0.5 font-mono text-[12px] hover:bg-white/5"
            >
              <span className="shrink-0 text-fg-subtle select-none">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={cn(
                  "shrink-0 font-semibold uppercase",
                  log.level === "error" || log.level === "fatal"
                    ? "text-danger"
                    : log.level === "warn"
                      ? "text-warning"
                      : "text-accent-secondary",
                )}
              >
                [{log.level}]
              </span>
              <span className="text-fg break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ShardRows({
  shards,
  missing,
  observedAt,
}: {
  shards: ShardStateView[];
  missing: number[];
  observedAt: string;
}) {
  const [expandedShardId, setExpandedShardId] = useState<number | null>(null);

  const rows = [
    ...shards.map((s) => ({ shardId: s.shardId, shard: s })),
    ...missing.map((shardId) => ({ shardId, shard: null })),
  ].sort((a, b) => a.shardId - b.shardId);
  const bodyRef = useStaggerIn<HTMLTableSectionElement>("tr", {
    resetKey: rows.map((r) => r.shardId).join(","),
  });

  return (
    <TableScroll>
      <Table>
        <THead>
          <TR>
            <TH className="w-16">Shard</TH>
            <TH>Status</TH>
            <TH className="text-right">Latency</TH>
            <TH className="text-right">Guilds</TH>
            <TH className="text-right">Last heartbeat</TH>
            <TH className="w-24 text-right">Console</TH>
          </TR>
        </THead>
        <TBody ref={bodyRef}>
          {rows.map(({ shardId, shard }) =>
            shard ? (
              <>
                <TR key={shardId}>
                  <TD className="font-mono tabular text-fg">{shardId}</TD>
                  <TD>
                    <Badge variant={statusVariant(shard.status)} dot>
                      {shard.status}
                    </Badge>
                  </TD>
                  <TD
                    className={cn(
                      "tabular text-right font-mono",
                      shard.ping !== null && shard.ping >= SlowPingMs
                        ? "text-warning"
                        : "text-fg-muted",
                    )}
                  >
                    {shard.ping === null ? "—" : `${shard.ping} ms`}
                  </TD>
                  <TD className="tabular text-right font-mono text-fg-muted">
                    {shard.guildCount}
                  </TD>
                  <TD className="tabular text-right font-mono text-fg-muted">
                    {since(shard.lastHeartbeatAt, observedAt)}
                  </TD>
                  <TD className="text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedShardId((prev) => (prev === shardId ? null : shardId))
                      }
                      className={cn(
                        "inline-flex items-center gap-1 rounded-control border px-2 py-1 text-xs font-medium transition-colors",
                        expandedShardId === shardId
                          ? "border-accent bg-accent-soft text-accent-fg"
                          : "border-border bg-surface text-fg-subtle hover:border-border-strong hover:text-fg",
                      )}
                    >
                      <Terminal className="size-3.5" />
                      <span>Logs</span>
                      {expandedShardId === shardId ? (
                        <ChevronUp className="size-3" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                    </button>
                  </TD>
                </TR>
                {expandedShardId === shardId ? (
                  <TR key={`${shardId}-logs`} className="border-t-0 bg-surface-subtle/30 hover:bg-surface-subtle/30">
                    <TD colSpan={6} className="p-3">
                      <ShardLogConsole shardId={shardId} logs={(shard as any).logs ?? []} />
                    </TD>
                  </TR>
                ) : null}
              </>
            ) : (
              <TR key={shardId} className="bg-danger-soft hover:bg-danger-soft">
                <TD className="font-mono tabular font-semibold text-danger">
                  {shardId}
                </TD>
                <TD colSpan={5}>
                  <span className="font-display flex items-center gap-1.5 text-[14px] font-semibold text-danger">
                    <CircleSlash className="size-3.5 shrink-0" aria-hidden />
                    Not reporting — no process is holding this shard
                  </span>
                </TD>
              </TR>
            ),
          )}
        </TBody>
      </Table>
    </TableScroll>
  );
}

function ReplicaCard({
  replica,
  shards,
  observedAt,
}: {
  replica: ClusterReplicaView;
  shards: ShardStateView[];
  observedAt: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <Cpu className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
          <span className="truncate font-mono">{replica.replicaId}</span>
        </CardTitle>
        <CardDescription>
          Holds shard {shardRange(shards.map((s) => s.shardId))}
        </CardDescription>
      </CardHeader>
      <ShardRows shards={shards} missing={[]} observedAt={observedAt} />
    </Card>
  );
}

export function ShardFleet({ data }: { data: RpcOutput<"system.shards.get"> }) {
  if (data.shards.length === 0 && data.shardCount === 0) {
    return (
      <Card>
        <EmptyState
          icon={Network}
          title="No shard has reported yet"
          description="Each gateway process publishes its shards every 10 seconds once it finishes connecting. Rows appear here as soon as the first worker is ready."
          footnote={`cluster ${data.clusterName}`}
        />
      </Card>
    );
  }

  const healthy = data.shards.filter((s) => s.status === HealthyStatus).length;

  return (
    <div className="flex flex-col gap-4">
      {data.shardCount > 0 ? (
        <div className="flex items-center gap-3">
          <ProgressRing
            value={(healthy / data.shardCount) * 100}
            size={44}
            strokeWidth={5}
          />
          <div>
            <p className="font-display text-[14px] font-semibold text-fg">
              {healthy} / {data.shardCount} shards healthy
            </p>
            <p className="text-[13px] text-fg-subtle">
              Ready and reporting, across the whole fleet.
            </p>
          </div>
        </div>
      ) : null}

      {data.missingShardIds.length > 0 ? (
        <Alert variant="danger">
          <p className="font-display font-semibold">
            {data.missingShardIds.length} of {data.shardCount} shards are not
            reporting
          </p>
          <p className="mt-0.5">
            Shard {shardRange(data.missingShardIds)} stopped publishing
            heartbeats, so the guilds on {pluralize(data.missingShardIds.length, "it", "them")}{" "}
            are receiving no gateway events. Check the gateway process that owns
            that range, or start a replacement covering it.
          </p>
        </Alert>
      ) : null}

      {data.replicas.map((replica) => {
        const shards = data.shards.filter((s) => s.replicaId === replica.replicaId);
        if (shards.length === 0) return null;
        return (
          <ReplicaCard
            key={replica.replicaId}
            replica={replica}
            shards={shards}
            observedAt={data.observedAt}
          />
        );
      })}

      {data.missingShardIds.length > 0 ? (
        <Card>
          <CardHeader actions={<Badge variant="danger" dot>Not reporting</Badge>}>
            <CardTitle>Shards with no process</CardTitle>
            <CardDescription>
              Shard {shardRange(data.missingShardIds)}{" "}
              {pluralize(data.missingShardIds.length, "is", "are")} within the
              cluster&apos;s shard count but no live process is reporting{" "}
              {pluralize(data.missingShardIds.length, "it", "them")}. Start another
              gateway replica, or lower TOTAL_SHARDS to match the fleet.
            </CardDescription>
          </CardHeader>
          <ShardRows shards={[]} missing={data.missingShardIds} observedAt={data.observedAt} />
        </Card>
      ) : null}
    </div>
  );
}
