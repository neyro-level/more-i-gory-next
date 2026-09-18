type PayloadLike = {
  findByID: (args: {
    collection: "feed-sources";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select: { feedUrlRef: true };
  }) => Promise<{ feedUrlRef?: string | null }>;
};

export async function loadFeedSourceUrlRef(
  payload: PayloadLike,
  feedSourceId: number | string,
): Promise<string | null> {
  const source = await payload.findByID({
    collection: "feed-sources",
    depth: 0,
    id: feedSourceId,
    overrideAccess: true,
    select: { feedUrlRef: true },
  });
  return typeof source.feedUrlRef === "string" && source.feedUrlRef.length > 0 ? source.feedUrlRef : null;
}
