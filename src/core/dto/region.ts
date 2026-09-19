import { z } from "zod";

import { publicMediaSchema } from "./media.ts";

export const publicRegionSchema = z.object({
  id: z.string().min(1),
  image: publicMediaSchema,
  investmentThesis: z.string().min(1),
  kind: z.enum(["region", "locality", "segment"]),
  lead: z.string().min(1),
  pageId: z.string().min(1),
  parentSlug: z.string().min(1).optional(),
  path: z.string().startsWith("/").endsWith("/"),
  riskSummary: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["published", "hidden", "stub"]),
  title: z.string().min(1),
});

export type PublicRegionDTO = z.infer<typeof publicRegionSchema>;
