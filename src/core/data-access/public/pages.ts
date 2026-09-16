import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import type { Page } from "../../../payload-types.ts";

async function readCmsPageByPath(path: string): Promise<Page | null> {
  try {
    const payload = await getPayload({ config });
    const pages = await payload.find({
      collection: "pages",
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        and: [{ path: { equals: path } }, { status: { equals: "published" } }],
      },
    });

    return pages.docs[0] ?? null;
  } catch {
    return null;
  }
}

export const getCmsPageByPath = unstable_cache(readCmsPageByPath, ["cms-page-by-path"], {
  tags: ["page"],
});
