import type { RegionDTO } from "@more-i-gory/contracts";

import { getRegionRoutePlan } from "./region-route-plan.ts";
import { regionSeedContent } from "./region-seed-content.ts";

function toContentStatus(status: string): RegionDTO["status"] {
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
  const content = regionSeedContent[entry.key];
  if (!content) throw new Error(`Missing CMS seed content for region "${entry.key}".`);

  return {
    childPageIds: childPageIdsByParent.get(entry.key) ?? [],
    heroMediaId: content.mediaSourceLabel,
    id: `region-${entry.key}`,
    investmentThesis: content.investmentThesis,
    lead: content.lead,
    pageId: entry.pageId,
    parentPageId: parent?.pageId ?? (entry.parentKey ? undefined : "PAGE-002"),
    path: entry.path,
    primaryQuery: content.primaryQuery,
    riskSummary: content.riskSummary,
    slug: entry.slug,
    status: toContentStatus(content.status),
    title: content.title,
  };
});
