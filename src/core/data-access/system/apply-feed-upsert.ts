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
      feedSource: true;
      id: true;
      importHash: true;
      origin: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{
    docs?: Array<{
      feedSource?: string | number | { id?: string | number } | null;
      id: number | string;
      importHash?: string | null;
      origin?: "feed" | "manual" | null;
    }>;
  }>;
  update: (args: {
    collection: "properties";
    data: Record<string, unknown>;
    id: number | string;
    overrideAccess: true;
  }) => Promise<unknown>;
};

function relationId(value: unknown): string | number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && "id" in value) return relationId(value.id);
  return null;
}

export async function findPropertiesByExternalId(
  payload: PayloadLike,
  externalId: string,
): Promise<ExistingImportedProperty[]> {
  const result = await payload.find({
    collection: "properties",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    select: {
      feedSource: true,
      id: true,
      importHash: true,
      origin: true,
    },
    where: { externalId: { equals: externalId } },
  });

  return (result.docs ?? [])
    .filter((doc) => doc.origin === "feed" || doc.origin === "manual")
    .map((doc) => ({
      feedSource: relationId(doc.feedSource),
      id: doc.id,
      importHash: doc.importHash,
      origin: doc.origin,
    }));
}

export function pickExistingPropertyForFeed(
  docs: ExistingImportedProperty[],
  feedSourceId: string,
): ExistingImportedProperty | null {
  return docs.find((doc) => String(doc.feedSource) === feedSourceId) ?? docs[0] ?? null;
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
