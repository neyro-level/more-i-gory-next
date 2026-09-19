import "server-only";

import type { Payload, RequiredDataFromCollectionSlug } from "payload";

export async function resolveSeedRegionMediaId(payload: Payload, sourceLabel: string): Promise<number | string> {
  const result = await payload.find({
    collection: "media",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { sourceLabel: { equals: sourceLabel } },
  });

  const media = result.docs[0];
  if (!media) throw new Error(`Missing media seed with sourceLabel "${sourceLabel}". Run media seed first.`);
  return media.id;
}

export async function upsertRegionSeed(
  payload: Payload,
  input: Readonly<{ data: RequiredDataFromCollectionSlug<"regions">; slug: string }>,
): Promise<Readonly<{ id: number | string; outcome: "created" | "updated" }>> {
  const result = await payload.find({
    collection: "regions",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: input.slug } },
  });
  const existing = result.docs[0];

  const document = existing
    ? await payload.update({
        collection: "regions",
        data: input.data,
        id: existing.id,
        overrideAccess: true,
      })
    : await payload.create({
        collection: "regions",
        data: input.data,
        overrideAccess: true,
      });

  return { id: document.id, outcome: existing ? "updated" : "created" };
}
