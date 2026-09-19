export type PostRunScheduleOutcome = "success" | "unchanged" | "suspicious" | "failed" | "interrupted";

export const maxImportFailureBackoffMultiplier = 8;

export function consecutiveImportFailureCount(statusesNewestFirst: readonly string[]): number {
  let count = 0;
  for (const status of statusesNewestFirst) {
    if (status === "failed" || status === "interrupted") count += 1;
    else break;
  }
  return count;
}

export function calculatePostRunNextDueAt(args: {
  consecutiveFailures: number;
  intervalMinutes: number;
  now: Date;
  outcome: PostRunScheduleOutcome;
}): Date {
  const intervalMs = Math.max(1, args.intervalMinutes) * 60_000;
  const failureBackoff =
    args.outcome === "failed" || args.outcome === "interrupted"
      ? Math.min(maxImportFailureBackoffMultiplier, 2 ** Math.max(0, args.consecutiveFailures - 1))
      : 1;
  return new Date(args.now.getTime() + intervalMs * failureBackoff);
}
