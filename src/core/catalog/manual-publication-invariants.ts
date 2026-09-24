export const MANUAL_PUBLICATION_MIN_SOURCES = 1;
export const MANUAL_PUBLICATION_MIN_FACTS = 1;

export type ManualPublicationRecord = {
  facts?: unknown;
  origin?: unknown;
  publishedAt?: unknown;
  region?: unknown;
  riskSummary?: unknown;
  slug?: unknown;
  sources?: unknown;
  verdict?: unknown;
  verifiedAt?: unknown;
};

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasPresentDate(value: unknown): boolean {
  if (value instanceof Date) return Number.isFinite(value.getTime());
  return hasNonEmptyString(value);
}

function labeledRows(value: unknown): readonly Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter((row): row is Record<string, unknown> => row != null && typeof row === "object") : [];
}

export function countPublicationSources(value: unknown): number {
  return labeledRows(value).filter((row) => hasNonEmptyString(row.label)).length;
}

export function countPublicationFacts(value: unknown): number {
  return labeledRows(value).filter((row) => hasNonEmptyString(row.label) && hasNonEmptyString(row.value)).length;
}

export function mergeManualPublicationRecord(
  original: ManualPublicationRecord | null | undefined,
  patch: ManualPublicationRecord,
): ManualPublicationRecord {
  return {
    facts: patch.facts !== undefined ? patch.facts : original?.facts,
    origin: patch.origin !== undefined ? patch.origin : original?.origin,
    publishedAt: patch.publishedAt !== undefined ? patch.publishedAt : original?.publishedAt,
    region: patch.region !== undefined ? patch.region : original?.region,
    riskSummary: patch.riskSummary !== undefined ? patch.riskSummary : original?.riskSummary,
    slug: patch.slug !== undefined ? patch.slug : original?.slug,
    sources: patch.sources !== undefined ? patch.sources : original?.sources,
    verdict: patch.verdict !== undefined ? patch.verdict : original?.verdict,
    verifiedAt: patch.verifiedAt !== undefined ? patch.verifiedAt : original?.verifiedAt,
  };
}

export function isManualPublicationAttempt(record: ManualPublicationRecord): boolean {
  return record.origin === "manual" && hasPresentDate(record.publishedAt);
}

export function manualPublicationGateError(record: ManualPublicationRecord): string | null {
  if (!isManualPublicationAttempt(record)) return null;
  if (!hasNonEmptyString(record.slug)) {
    return "Published manual passports require slug.";
  }
  if (record.region == null || record.region === "") {
    return "Published manual passports require a region relation.";
  }
  if (!hasPresentDate(record.verifiedAt)) {
    return "Published manual passports require verifiedAt.";
  }
  if (!hasNonEmptyString(record.verdict)) {
    return "Published manual passports require verdict.";
  }
  if (!hasNonEmptyString(record.riskSummary)) {
    return "Published manual passports require riskSummary.";
  }
  if (countPublicationSources(record.sources) < MANUAL_PUBLICATION_MIN_SOURCES) {
    return `Published manual passports require at least ${MANUAL_PUBLICATION_MIN_SOURCES} source.`;
  }
  if (countPublicationFacts(record.facts) < MANUAL_PUBLICATION_MIN_FACTS) {
    return "Published manual passports require required facts.";
  }
  return null;
}
