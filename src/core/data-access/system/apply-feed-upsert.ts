import type { ExistingImportedProperty } from "../../ingest/import-state.ts";

type PayloadLike = {
  create: (args: {
    collection: "properties";
    data: Record<string, unknown>;
    overrideAccess: true;
  }) => Promise<{ id?: number | string }>;
  find: (args: {
    collection: "properties";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select: {
      externalId: true;
      feedSource: true;
      id: true;
      importHash: true;
      origin: true;
      title: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{
    docs?: Array<{
      externalId?: string | null;
      feedSource?: string | number | { id?: string | number } | null;
      id: number | string;
      importHash?: string | null;
      origin?: "feed" | "manual" | null;
      title?: string | null;
    }>;
  }>;
  update: (args: {
    collection: "properties";
    data: Record<string, unknown>;
    id?: number | string;
    overrideAccess: true;
    where?: Record<string, unknown>;
  }) => Promise<unknown>;
};

export const feedUpsertBatchSize = 200;

function relationId(value: unknown): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value) return relationId(value.id);
  return null;
}

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export async function findFeedUpsertCandidates(
  payload: PayloadLike,
  args: { externalIds: readonly string[]; feedSourceId: string },
): Promise<ExistingImportedProperty[]> {
  const externalIds = [...new Set(args.externalIds)];
  const docs: NonNullable<Awaited<ReturnType<PayloadLike["find"]>>["docs"]> = [];

  for (const batch of chunks(externalIds, feedUpsertBatchSize)) {
    if (batch.length === 0) continue;
    const result = await payload.find({
      collection: "properties",
      depth: 0,
      limit: batch.length * 2,
      overrideAccess: true,
      pagination: false,
      select: {
        externalId: true,
        feedSource: true,
        id: true,
        importHash: true,
        origin: true,
        title: true,
      },
      where: {
        or: [
          {
            and: [
              { feedSource: { equals: args.feedSourceId } },
              { externalId: { in: batch } },
            ],
          },
          {
            and: [
              { origin: { equals: "manual" } },
              { externalId: { in: batch } },
            ],
          },
        ],
      },
    });
    docs.push(...(result.docs ?? []));
  }

  return docs
    .filter(
      (doc) =>
        typeof doc.externalId === "string" &&
        (doc.origin === "feed" || doc.origin === "manual"),
    )
    .map((doc) => ({
      externalId: doc.externalId as string,
      feedSource: relationId(doc.feedSource),
      id: doc.id,
      importHash: doc.importHash,
      origin: doc.origin === "manual" ? "manual" : "feed",
      title: typeof doc.title === "string" ? doc.title : null,
    }));
}

export function pickExistingPropertyForFeed(
  docs: ExistingImportedProperty[],
  externalId: string,
  feedSourceId: string,
): ExistingImportedProperty | null {
  const matching = docs.filter((doc) => doc.externalId === externalId);
  return (
    matching.find((doc) => doc.origin === "feed" && String(doc.feedSource) === feedSourceId) ??
    matching.find((doc) => doc.origin === "manual") ??
    null
  );
}

export async function createFeedOwnedProperty(
  payload: PayloadLike,
  data: Record<string, unknown>,
): Promise<{ id?: number | string }> {
  return payload.create({
    collection: "properties",
    data,
    overrideAccess: true,
  });
}

export async function updateFeedOwnedProperty(
  payload: PayloadLike,
  id: number | string,
  data: Record<string, unknown>,
): Promise<void> {
  await payload.update({
    collection: "properties",
    data,
    id,
    overrideAccess: true,
  });
}

export async function updateFeedOwnedProperties(
  payload: PayloadLike,
  ids: readonly (number | string)[],
  data: Record<string, unknown>,
): Promise<void> {
  for (const batch of chunks(ids, feedUpsertBatchSize)) {
    if (batch.length === 0) continue;
    await payload.update({
      collection: "properties",
      data,
      overrideAccess: true,
      where: { id: { in: batch } },
    });
  }
}
