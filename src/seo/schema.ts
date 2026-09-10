import { z } from "zod";

export const seoEntrySchema = z.object({
  canonical: z.string().startsWith("/"),
  contentGate: z.string().min(1),
  description: z.string().min(40),
  h1: z.string().min(1),
  index: z.enum(["yes", "gate", "trust_gate", "noindex"]),
  kind: z.enum(["static", "dynamic"]),
  pageId: z.string().regex(/^PAGE-\d{3}$/),
  primaryQuery: z.string().min(1),
  priority: z.enum(["P1", "P2", "P3"]),
  secondaryQueries: z.array(z.string()).default([]),
  sitemap: z.enum(["yes", "gate", "no"]),
  title: z.string().min(10),
});

export type SeoEntry = z.infer<typeof seoEntrySchema>;
