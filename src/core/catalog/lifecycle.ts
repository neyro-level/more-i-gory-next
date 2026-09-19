import {
  type ArchivedPropertyAction,
  type ArchiveReplacementCandidate,
  archiveRetentionDays,
  getArchivedPropertyAction,
} from "../data-access/public/properties-contract.ts";

export type CatalogLifecycleProperty = Readonly<{
  complex?: unknown;
  deactivatedAt?: string | null;
  id: number | string;
  market?: "secondary" | "newbuild" | null;
  region?: unknown;
  slug: string;
  status: "archived";
}>;

export type CatalogLifecyclePublishedProperty = Readonly<{
  complex?: unknown;
  id?: number | string;
  market?: "secondary" | "newbuild" | null;
  region?: unknown;
  slug: string;
}>;

export type CatalogLifecycleEntry = Readonly<{
  action: ArchivedPropertyAction;
  id: number | string;
  slug: string;
}>;

export type CatalogLifecyclePlan = Readonly<{
  entries: readonly CatalogLifecycleEntry[];
  expired: number;
  retained: number;
  retentionDays: number;
}>;

function relationId(value: unknown): string | undefined {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const id = value.trim();
    return id || undefined;
  }
  if (value && typeof value === "object" && "id" in value) {
    return relationId((value as { id: unknown }).id);
  }
}

function regionLabel(value: unknown): string {
  if (value && typeof value === "object" && "label" in value) {
    const label = (value as { label: unknown }).label;
    if (typeof label === "string" && label.trim()) return label;
  }
  return relationId(value) ?? "";
}

export function toArchiveReplacementCandidate(
  record: CatalogLifecyclePublishedProperty,
): ArchiveReplacementCandidate {
  return {
    complexId: relationId(record.complex),
    market: record.market ?? undefined,
    path: `/obekty/${record.slug}/`,
    regionLabel: regionLabel(record.region),
    slug: record.slug,
  };
}

export function planCatalogLifecycle(
  properties: readonly CatalogLifecycleProperty[],
  now = new Date(),
  published: readonly CatalogLifecyclePublishedProperty[] = [],
): CatalogLifecyclePlan {
  const publishedCandidates = published.map(toArchiveReplacementCandidate);
  const entries = properties.map((property) => {
    const identity = toArchiveReplacementCandidate(property);
    return {
      action: getArchivedPropertyAction(
        {
          complexId: identity.complexId,
          deactivatedAt: property.deactivatedAt ?? undefined,
          market: identity.market,
          path: identity.path,
          regionLabel: identity.regionLabel,
          slug: property.slug,
          status: property.status,
        },
        now,
        publishedCandidates,
      ),
      id: property.id,
      slug: property.slug,
    };
  });

  const expired = entries.filter((entry) => entry.action.kind !== "serve-noindex").length;

  return {
    entries,
    expired,
    retained: entries.length - expired,
    retentionDays: archiveRetentionDays,
  };
}
