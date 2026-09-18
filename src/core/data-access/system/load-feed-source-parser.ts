type PayloadLike = {
  findByID: (args: {
    collection: "feed-sources";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select: { parser: true };
  }) => Promise<{ parser?: string | null }>;
};

export async function loadFeedSourceParser(
  payload: PayloadLike,
  feedSourceId: number | string,
): Promise<string | null> {
  const source = await payload.findByID({
    collection: "feed-sources",
    depth: 0,
    id: feedSourceId,
    overrideAccess: true,
    select: { parser: true },
  });
  return typeof source.parser === "string" && source.parser.length > 0 ? source.parser : null;
}
