export const HealthyStatus = "Ready";
export const OfflineStatuses = new Set(["Disconnected", "Idle"]);

export function isShardHealthy(shard: { status: string; stale?: boolean }): boolean {
  return shard.status.toLowerCase() === "ready" && !shard.stale;
}
