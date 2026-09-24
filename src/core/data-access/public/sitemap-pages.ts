import "server-only";

import type { SelectType } from "payload";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { sitemapPageSchema, type SitemapPageDTO } from "../../dto/sitemap-page.ts";
import { publicReadOrThrow } from "./read-fallback.ts";

const sitemapPageSelect = {
  path: true,
  seo: true,
  status: true,
} satisfies SelectType;

export async function listPublishedSitemapPages(): Promise<readonly SitemapPageDTO[]> {
  return publicReadOrThrow({
    reader: "sitemap-cms-pages",
    read: async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "pages",
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: sitemapPageSelect,
        where: {
          status: { equals: "published" },
        },
      });

      return result.docs.map((page) => sitemapPageSchema.parse(page));
    },
  });
}
