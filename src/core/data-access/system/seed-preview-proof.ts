import "server-only";

import type { Payload, RequiredDataFromCollectionSlug } from "payload";

type PreviewPropertyData = RequiredDataFromCollectionSlug<"properties"> & { slug: string };

export const previewProofRecords = {
  draft: {
    market: "secondary",
    needsReview: false,
    origin: "manual",
    slug: "db-proof-draft",
    status: "active",
    title: "Технический черновик DB",
  },
  published: {
    facts: [
      {
        label: "Назначение",
        value: "Проверка чтения единственной базы техническим preview-контуром.",
      },
    ],
    market: "secondary",
    needsReview: false,
    origin: "manual",
    publishedAt: "2026-09-21T00:00:00.000Z",
    riskSummary: "Техническая запись, не являющаяся объектом недвижимости или коммерческим предложением.",
    slug: "db-proof-published",
    sources: [{ label: "Внутренняя техническая проверка" }],
    status: "active",
    title: "Техническая проверка DB",
    verifiedAt: "2026-09-21T00:00:00.000Z",
    verdict: "Маршрут использует Payload и единственную PostgreSQL database.",
  },
} as const satisfies Readonly<{
  draft: PreviewPropertyData;
  published: PreviewPropertyData;
}>;

async function upsertProperty(
  payload: Payload,
  data: PreviewPropertyData,
): Promise<Readonly<{ id: number | string; outcome: "created" | "updated"; slug: string }>> {
  const result = await payload.find({
    collection: "properties",
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: data.slug } },
  });
  const existing = result.docs[0];
  const document = existing
    ? await payload.update({
        collection: "properties",
        data,
        id: existing.id,
        overrideAccess: true,
      })
    : await payload.create({
        collection: "properties",
        data,
        overrideAccess: true,
      });

  return { id: document.id, outcome: existing ? "updated" : "created", slug: data.slug };
}

export async function upsertPreviewProofRecords(payload: Payload) {
  const published = await upsertProperty(payload, previewProofRecords.published);
  const draft = await upsertProperty(payload, previewProofRecords.draft);
  return { draft, published } as const;
}
