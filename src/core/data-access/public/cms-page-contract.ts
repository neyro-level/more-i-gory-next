import { cmsPageSchema, type CmsPageDTO } from "../../dto/cms-page.ts";

export { cmsPageBlockSchema, cmsPageSchema, cmsSeoSchema } from "../../dto/cms-page.ts";
export type { CmsPageBlockDTO, CmsPageDTO, CmsSeoDTO } from "../../dto/cms-page.ts";

export const publicCmsPageSelect = {
  blocks: true,
  path: true,
  seo: true,
  slug: true,
  status: true,
  summary: true,
  title: true,
} as const;

export function mapCmsPage(document: unknown): CmsPageDTO {
  const record = document && typeof document === "object" ? (document as Record<string, unknown>) : {};
  const seo =
    record.seo && typeof record.seo === "object"
      ? (record.seo as Record<string, unknown>)
      : {};

  return cmsPageSchema.parse({
    blocks: Array.isArray(record.blocks) ? record.blocks : [],
    path: record.path,
    seo: {
      canonicalOverride: seo.canonicalOverride ?? undefined,
      description: seo.description ?? undefined,
      ogImagePath: seo.ogImagePath ?? undefined,
      priority: seo.priority ?? "P2",
      robots: seo.robots ?? "index-follow",
      title: seo.title ?? undefined,
    },
    slug: record.slug,
    status: record.status,
    summary: record.summary ?? undefined,
    title: record.title,
  });
}
