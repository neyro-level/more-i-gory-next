import { z } from "zod";

import { publicMediaSchema } from "./media.ts";

export const publicPropertySchema = z.object({
  budgetNote: z.string().optional(),
  deactivatedAt: z.string().optional(),
  description: z.string().optional(),
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  id: z.string().min(1),
  image: publicMediaSchema,
  market: z.enum(["secondary", "newbuild"]).optional(),
  complexId: z.string().min(1).optional(),
  path: z.string().startsWith("/").endsWith("/"),
  publishedAt: z.string().min(1),
  regionLabel: z.string().min(1),
  riskSummary: z.string().min(1),
  slug: z.string().min(1),
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().optional() })).min(1),
  status: z.enum(["active", "archived"]),
  title: z.string().min(1),
  verdict: z.string().min(1),
  verifiedAt: z.string().min(1),
});

export type PublicPropertyDTO = z.infer<typeof publicPropertySchema>;
