type PayloadLike = {
  findByID: (args: {
    collection: "feed-sources";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select: { lastEtag: true; lastFeedHash: true; lastModified: true };
  }) => Promise<{ lastEtag?: string | null; lastFeedHash?: string | null; lastModified?: string | null }>;
};

export async function loadFeedSourceConditionalState(
  payload: PayloadLike,
  feedSourceId: number | string,
): Promise<{ lastEtag: string | null; lastFeedHash: string | null; lastModified: string | null }> {
  const source = await payload.findByID({
    collection: "feed-sources",
    depth: 0,
    id: feedSourceId,
    overrideAccess: true,
    select: { lastEtag: true, lastFeedHash: true, lastModified: true },
  });
  return {
    lastEtag: typeof source.lastEtag === "string" && source.lastEtag.length > 0 ? source.lastEtag : null,
    lastFeedHash:
      typeof source.lastFeedHash === "string" && source.lastFeedHash.length > 0 ? source.lastFeedHash : null,
    lastModified:
      typeof source.lastModified === "string" && source.lastModified.length > 0 ? source.lastModified : null,
  };
}
