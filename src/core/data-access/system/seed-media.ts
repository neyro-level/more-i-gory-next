import "server-only";

import type { Payload, RequiredDataFromCollectionSlug } from "payload";

export async function upsertMediaSeedAsset(
  payload: Payload,
  input: Readonly<{
    data: RequiredDataFromCollectionSlug<"media">;
    filename: string;
    filePath: string;
  }>,
): Promise<"created" | "existing"> {
  const result = await payload.find({
    collection: "media",
    limit: 1,
    overrideAccess: true,
    where: {
      filename: {
        equals: input.filename,
      },
    },
  });
  const existing = result.docs[0];

  if (existing) {
    return "existing";
  }

  await payload.create({
    collection: "media",
    data: input.data,
    filePath: input.filePath,
    overrideAccess: true,
    overwriteExistingFiles: true,
  });
  return "created";
}
