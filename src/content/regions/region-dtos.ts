import type { RegionDTO } from "@more-i-gory/contracts";

import { getRegionRoutePlan, type RegionRouteEntry } from "./region-route-plan.ts";

function toContentStatus(status: RegionRouteEntry["status"]): RegionDTO["status"] {
  if (status === "published") return "published";
  if (status === "stub") return "draft";
  return "review";
}

const routePlan = getRegionRoutePlan();
const entriesByKey = new Map(routePlan.map((entry) => [entry.key, entry]));
const childPageIdsByParent = new Map<string, string[]>();

for (const entry of routePlan) {
  if (!entry.parentKey) continue;

  const childPageIds = childPageIdsByParent.get(entry.parentKey) ?? [];
  childPageIds.push(entry.pageId);
  childPageIdsByParent.set(entry.parentKey, childPageIds);
}

export const regionDtos = routePlan.map((entry): RegionDTO => {
  const parent = entry.parentKey ? entriesByKey.get(entry.parentKey) : null;

  return {
    childPageIds: childPageIdsByParent.get(entry.key) ?? [],
    heroMediaId: entry.mediaSourceLabel,
    id: `region-${entry.key}`,
    investmentThesis: entry.investmentThesis,
    lead: entry.lead,
    pageId: entry.pageId,
    parentPageId: parent?.pageId ?? (entry.parentKey ? undefined : "PAGE-002"),
    path: entry.path,
    primaryQuery: entry.primaryQuery,
    riskSummary: entry.riskSummary,
    slug: entry.slug,
    status: toContentStatus(entry.status),
    title: entry.title,
  };
});
