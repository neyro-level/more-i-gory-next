import { pathToFileURL } from "node:url";

import { getRegionRoutePath, regionRouteEntries as regionSeedEntries } from "../src/content/regions/region-route-plan.ts";
import { regionSeedContent } from "../src/content/regions/region-seed-content.ts";
import { resolveSeedRegionMediaId, upsertRegionSeed } from "../src/core/data-access/system/seed-regions.ts";

export { regionSeedEntries };

function seedEntry(entry) {
  const content = regionSeedContent[entry.key];
  if (!content) throw new Error(`Missing CMS seed content for region "${entry.key}".`);
  return { ...entry, ...content, path: getRegionRoutePath(entry) };
}

function createBlocks(entry) {
  return [
    {
      blockType: "lead",
      title: entry.title,
      text: entry.lead,
    },
    {
      blockType: "thesis",
      title: "Инвестиционная логика",
      items: [{ title: "Черновик", text: entry.investmentThesis }],
    },
    {
      blockType: "risk-block",
      title: "Риски",
      text: entry.riskSummary,
    },
  ];
}

export function getPayloadRegionData(entry, parentId, heroMediaId) {
  const content = seedEntry(entry);
  return {
    blocks: createBlocks(content),
    heroMedia: heroMediaId,
    investmentThesis: content.investmentThesis,
    kind: content.kind,
    lead: content.lead,
    order: content.order,
    pageKey: entry.pageKey ?? undefined,
    parent: parentId ?? undefined,
    riskSummary: content.riskSummary,
    seo: {
      description: `${content.title}: черновик страницы до утверждения контента владельцем.`,
      priority: content.seoPriority,
      robots: "noindex-follow",
      title: `${content.title} — черновик региона`,
    },
    slug: content.slug,
    status: content.status,
    title: content.title,
  };
}

export function getRegionSeedPlan() {
  return regionSeedEntries.map((entry) => seedEntry(entry));
}

async function seed() {
  const dryRun = process.argv.includes("--dry-run");
  const plan = getRegionSeedPlan();

  if (dryRun) {
    console.table(plan.map(({ key, kind, path, status, title }) => ({ key, kind, path, status, title })));
    return;
  }

  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("../payload.config.ts")]);
  const payload = await getPayload({ config });
  const regionIds = new Map();

  for (const entry of regionSeedEntries) {
    const content = seedEntry(entry);
    const heroMediaId = await resolveSeedRegionMediaId(payload, content.mediaSourceLabel);
    const parentId = entry.parentKey ? regionIds.get(entry.parentKey) : undefined;
    if (entry.parentKey && !parentId) throw new Error(`Parent "${entry.parentKey}" must be seeded before "${entry.key}".`);

    const data = getPayloadRegionData(entry, parentId, heroMediaId);
    const result = await upsertRegionSeed(payload, { data, slug: entry.slug });

    regionIds.set(entry.key, result.id);
    payload.logger.info(`${result.outcome === "updated" ? "Updated" : "Created"} region seed ${entry.key}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seed();
}
