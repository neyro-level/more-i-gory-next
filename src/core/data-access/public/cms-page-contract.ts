import { z } from "zod";

const cmsLinkSchema = z
  .object({
    href: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
  })
  .optional();

const cmsImageFieldsSchema = {
  imageAlt: z.string().optional(),
  imagePath: z.string().optional(),
};

export const cmsSeoSchema = z.object({
  canonicalOverride: z.string().optional(),
  description: z.string().min(1).optional(),
  ogImagePath: z.string().optional(),
  priority: z.enum(["P1", "P2", "P3"]),
  robots: z.enum(["index-follow", "noindex-follow"]),
  title: z.string().min(1).optional(),
});

export type CmsSeoDTO = z.infer<typeof cmsSeoSchema>;

const cmsHeroBlockSchema = z.object({
  blockType: z.literal("hero"),
  eyebrow: z.string().optional(),
  lead: z.string().min(1),
  primaryCta: cmsLinkSchema,
  proof: z.string().optional(),
  secondaryCta: cmsLinkSchema,
  title: z.string().min(1),
  ...cmsImageFieldsSchema,
});

const cmsLeadBlockSchema = z.object({
  blockType: z.literal("lead"),
  eyebrow: z.string().optional(),
  text: z.string().min(1),
  title: z.string().min(1),
});

const cmsThesisBlockSchema = z.object({
  blockType: z.literal("thesis"),
  items: z
    .array(
      z.object({
        text: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(1),
  title: z.string().min(1),
});

const cmsRiskBlockSchema = z.object({
  blockType: z.literal("risk-block"),
  text: z.string().min(1),
  title: z.string().min(1),
});

const cmsNumberedStepsBlockSchema = z.object({
  blockType: z.literal("numbered-steps"),
  eyebrow: z.string().optional(),
  lead: z.string().optional(),
  steps: z
    .array(
      z.object({
        text: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(1),
  title: z.string().min(1),
});

const cmsProofBlockSchema = z.object({
  blockType: z.literal("proof-block"),
  proof: z.string().min(1),
  title: z.string().min(1),
});

const cmsScenarioTableBlockSchema = z.object({
  blockType: z.literal("scenario-table"),
  rows: z
    .array(
      z.object({
        assumption: z.string().min(1),
        investorQuestion: z.string().min(1),
        scenario: z.string().min(1),
      }),
    )
    .min(1),
  title: z.string().min(1),
});

const cmsCardsGridBlockSchema = z.object({
  blockType: z.literal("cards-grid"),
  cards: z
    .array(
      z.object({
        link: cmsLinkSchema,
        text: z.string().min(1),
        title: z.string().min(1),
      }),
    )
    .min(1),
  lead: z.string().optional(),
  title: z.string().min(1),
});

const cmsObjectCardsBlockSchema = z.object({
  blockType: z.literal("object-cards"),
  items: z
    .array(
      z.object({
        href: z.string().min(1),
        location: z.string().min(1),
        risk: z.string().min(1),
        status: z.string().min(1),
        thesis: z.string().min(1),
        title: z.string().min(1),
        ...cmsImageFieldsSchema,
      }),
    )
    .min(1),
  lead: z.string().optional(),
  title: z.string().min(1),
});

const cmsCtaBlockSchema = z.object({
  blockType: z.literal("cta"),
  primaryCta: z.object({
    href: z.string().min(1),
    label: z.string().min(1),
  }),
  secondaryCta: cmsLinkSchema,
  text: z.string().min(1),
  title: z.string().min(1),
});

const cmsRichTextBlockSchema = z.object({
  blockType: z.literal("rich-text"),
  content: z.unknown(),
});

export const cmsPageBlockSchema = z.discriminatedUnion("blockType", [
  cmsHeroBlockSchema,
  cmsLeadBlockSchema,
  cmsThesisBlockSchema,
  cmsRiskBlockSchema,
  cmsNumberedStepsBlockSchema,
  cmsProofBlockSchema,
  cmsScenarioTableBlockSchema,
  cmsCardsGridBlockSchema,
  cmsObjectCardsBlockSchema,
  cmsCtaBlockSchema,
  cmsRichTextBlockSchema,
]);

export type CmsPageBlockDTO = z.infer<typeof cmsPageBlockSchema>;

export const cmsPageSchema = z.object({
  blocks: z.array(cmsPageBlockSchema).min(1),
  path: z.string().startsWith("/"),
  seo: cmsSeoSchema,
  slug: z.string().min(1),
  status: z.literal("published"),
  summary: z.string().optional(),
  title: z.string().min(1),
});

export type CmsPageDTO = z.infer<typeof cmsPageSchema>;

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
