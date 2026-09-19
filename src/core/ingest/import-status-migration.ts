export const unchanged304Summary = "Feed unchanged (HTTP 304).";

export type HistoricalImportRun = Readonly<{
  createdAt?: string | null;
  feedHash?: string | null;
  finishedAt?: string | null;
  id?: number | string;
  offeredCount?: number | null;
  status?: string | null;
  summary?: string | null;
}>;

export type ImportStatusMigrationReport = Readonly<{
  ambiguousSkipped: HistoricalImportRun[];
  counts: Record<string, number>;
  mappings: Readonly<{ completedToSuccess: number; skipped304ToUnchanged: number }>;
  safeToMigrate: boolean;
}>;

export function buildImportStatusMigrationPreflight(
  rows: readonly HistoricalImportRun[],
): ImportStatusMigrationReport {
  const counts: Record<string, number> = {};
  const ambiguousSkipped: HistoricalImportRun[] = [];
  let completedToSuccess = 0;
  let skipped304ToUnchanged = 0;

  for (const row of rows) {
    const status = row.status ?? "<null>";
    counts[status] = (counts[status] ?? 0) + 1;
    if (status === "completed") completedToSuccess += 1;
    if (status !== "skipped") continue;
    if (row.summary === unchanged304Summary) skipped304ToUnchanged += 1;
    else ambiguousSkipped.push(row);
  }

  return {
    ambiguousSkipped,
    counts,
    mappings: { completedToSuccess, skipped304ToUnchanged },
    safeToMigrate: ambiguousSkipped.length === 0,
  };
}
