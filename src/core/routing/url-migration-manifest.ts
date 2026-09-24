import manifest from "../../../docs/migration/V5_URL_MANIFEST.json";

export type UrlMigrationEntry = Readonly<{
  currentCanonical: string;
  currentPattern: string;
  migrationAction: "GONE_410" | "KEEP" | "NOINDEX_RETAIN" | "REDIRECT_301" | "REMOVE_404" | "REVIEW";
  targetUrl?: string | null;
}>;

const entries = manifest.entries as readonly UrlMigrationEntry[];

export function getUrlMigrationByCurrentPath(path: string): UrlMigrationEntry | null {
  return entries.find((entry) => entry.currentPattern === path) ?? null;
}
