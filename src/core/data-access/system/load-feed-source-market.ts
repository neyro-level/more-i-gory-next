type FeedSourceMarket = "newbuild" | "secondary";

type PayloadLike = {
  findByID: (args: {
    collection: "feed-sources";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select: { market: true };
  }) => Promise<{ market?: FeedSourceMarket | null }>;
};

export async function loadFeedSourceMarket(
  payload: PayloadLike,
  feedSourceId: number | string,
): Promise<FeedSourceMarket | null> {
  const source = await payload.findByID({
    collection: "feed-sources",
    depth: 0,
    id: feedSourceId,
    overrideAccess: true,
    select: { market: true },
  });
  return source.market === "newbuild" || source.market === "secondary" ? source.market : null;
}
