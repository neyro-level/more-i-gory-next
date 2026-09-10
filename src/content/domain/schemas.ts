import { z } from "zod";

export const contentStatusSchema = z.enum(["draft", "review", "published", "archived"]);

export const mediaAssetSchema = z
  .object({
    alt: z.string(),
    credit: z.string().optional(),
    decorative: z.boolean().default(false),
    height: z.int().positive(),
    id: z.string().min(1),
    kind: z.enum(["region", "project", "og", "ui"]),
    src: z.string().startsWith("/"),
    width: z.int().positive(),
  })
  .superRefine((asset, context) => {
    if (asset.decorative && asset.alt !== "") {
      context.addIssue({
        code: "custom",
        message: "Decorative media must use empty alt text.",
        path: ["alt"],
      });
    }

    if (!asset.decorative && asset.alt.trim().length < 8) {
      context.addIssue({
        code: "custom",
        message: "Content media requires descriptive alt text.",
        path: ["alt"],
      });
    }
  });

export const sourceSchema = z.object({
  accessedAt: z.string().optional(),
  id: z.string().min(1),
  publisher: z.string().optional(),
  title: z.string().min(1),
  url: z.string().url().optional(),
});

export const regionSchema = z.object({
  childPageIds: z.array(z.string()).default([]),
  heroMediaId: z.string().min(1),
  id: z.string().min(1),
  investmentThesis: z.string().min(20),
  lead: z.string().min(20),
  pageId: z.string().min(1),
  parentPageId: z.string().optional(),
  path: z.string().startsWith("/").endsWith("/"),
  primaryQuery: z.string().min(1),
  riskSummary: z.string().min(20),
  slug: z.string().min(1),
  status: contentStatusSchema,
  title: z.string().min(1),
});

export const projectSchema = z
  .object({
    budgetNote: z.string().min(1),
    coverMediaId: z.string().min(1),
    facts: z.array(z.string()).default([]),
    id: z.string().min(1),
    path: z.string().startsWith("/").endsWith("/"),
    regionId: z.string().min(1),
    riskSummary: z.string().min(20),
    slug: z.string().min(1),
    sourceIds: z.array(z.string()).default([]),
    status: contentStatusSchema,
    title: z.string().min(1),
    verdict: z.string().min(20),
    verifiedAt: z.string().optional(),
  })
  .superRefine((project, context) => {
    if (project.status === "published" && !project.verifiedAt) {
      context.addIssue({
        code: "custom",
        message: "Published project requires verifiedAt.",
        path: ["verifiedAt"],
      });
    }

    if (project.status === "published" && project.sourceIds.length === 0) {
      context.addIssue({
        code: "custom",
        message: "Published project requires at least one source.",
        path: ["sourceIds"],
      });
    }
  });

export const articleSchema = z.object({
  description: z.string().min(20),
  id: z.string().min(1),
  path: z.string().startsWith("/").endsWith("/"),
  primaryQuery: z.string().min(1),
  publishedAt: z.string().optional(),
  relatedProjectIds: z.array(z.string()).default([]),
  relatedRegionIds: z.array(z.string()).default([]),
  reviewedAt: z.string().optional(),
  secondaryQueries: z.array(z.string()).default([]),
  slug: z.string().min(1),
  sourceIds: z.array(z.string()).default([]),
  status: contentStatusSchema,
  targetPageId: z.string().min(1),
  title: z.string().min(1),
});

export const pageContentSchema = z.object({
  ctaPrimary: z.string().min(1),
  ctaSecondary: z.string().optional(),
  id: z.string().min(1),
  lead: z.string().min(20),
  mediaId: z.string().optional(),
  path: z.string().startsWith("/").endsWith("/"),
  status: contentStatusSchema,
  title: z.string().min(1),
});

export const personSchema = z.object({
  bio: z.string().optional(),
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  status: contentStatusSchema,
});
