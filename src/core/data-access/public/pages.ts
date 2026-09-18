import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { mapCmsPage, publicCmsPageSelect, type CmsPageDTO } from "./cms-page-contract.ts";

async function readCmsPageByPath(path: string): Promise<CmsPageDTO | null> {
  try {
    const payload = await getPayload({ config });
    const pages = await payload.find({
      collection: "pages",
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      select: publicCmsPageSelect,
      where: {
        and: [{ path: { equals: path } }, { status: { equals: "published" } }],
      },
    });

    const document = pages.docs[0];
    return document ? mapCmsPage(document) : null;
  } catch {
    return null;
  }
}

export const getCmsPageByPath = unstable_cache(readCmsPageByPath, ["cms-page-by-path"], {
  tags: ["page"],
});
