import {
  type ArchivedPropertyAction,
  archiveRetentionDays,
  getArchivedPropertyAction,
} from "../data-access/public/properties-contract.ts";

export type CatalogLifecycleProperty = Readonly<{
  deactivatedAt?: string | null;
  id: number | string;
  slug: string;
  status: "archived";
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

export function planCatalogLifecycle(
  properties: readonly CatalogLifecycleProperty[],
  now = new Date(),
): CatalogLifecyclePlan {
  const entries = properties.map((property) => ({
    action: getArchivedPropertyAction(
      {
        deactivatedAt: property.deactivatedAt ?? undefined,
        status: property.status,
      },
      now,
    ),
    id: property.id,
    slug: property.slug,
  }));

  const expired = entries.filter((entry) => entry.action.kind === "redirect").length;

  return {
    entries,
    expired,
    retained: entries.length - expired,
    retentionDays: archiveRetentionDays,
  };
}
