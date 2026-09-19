import { z } from "zod";

export const sitemapPageSchema = z.object({
  path: z.string().startsWith("/"),
  seo: z.object({
    canonicalOverride: z.string().nullable().optional(),
    priority: z.enum(["P1", "P2", "P3"]),
    robots: z.enum(["index-follow", "noindex-follow"]),
  }),
  status: z.literal("published"),
});

export type SitemapPageDTO = z.infer<typeof sitemapPageSchema>;
