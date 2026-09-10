import { defineCollection, defineConfig, s } from "velite";

const articleStatus = ["draft", "review", "published", "archived"] as const;

const articles = defineCollection({
  name: "Article",
  pattern: "articles/**/*.md",
  schema: s.object({
    id: s.string(),
    slug: s.string(),
    status: s.enum(articleStatus),
    title: s.string(),
    description: s.string(),
    primaryQuery: s.string(),
    secondaryQueries: s.array(s.string()).default([]),
    targetPageId: s.string(),
    relatedRegionIds: s.array(s.string()).default([]),
    relatedProjectIds: s.array(s.string()).default([]),
    sources: s.array(s.string()).default([]),
    publishedAt: s.string().optional(),
    reviewedAt: s.string().optional(),
    content: s.markdown(),
  }),
});

export default defineConfig({
  collections: { articles },
  markdown: {
    copyLinkedFiles: false,
  },
  output: {
    assets: "public/static",
    base: "/static/",
    clean: true,
    data: ".velite",
  },
  root: "content",
  strict: true,
});
