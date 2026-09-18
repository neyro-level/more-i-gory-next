import type { z } from "zod";

import {
  articleSchema,
  contentStatusSchema,
  landingPageSchema,
  mediaAssetSchema,
  pageContentSchema,
  personSchema,
  projectSchema,
  propertyCategorySchema,
  propertyDealTypeSchema,
  propertyEnumWriteSchema,
  regionSchema,
  seoEntrySchema,
  sourceSchema,
} from "./schemas.ts";

export type ContentStatus = z.infer<typeof contentStatusSchema>;
export type MediaAssetDTO = z.infer<typeof mediaAssetSchema>;
export type MediaAssetKind = MediaAssetDTO["kind"];
export type SourceDTO = z.infer<typeof sourceSchema>;
export type RegionDTO = z.infer<typeof regionSchema>;
export type ProjectDTO = z.infer<typeof projectSchema>;
export type ArticleDTO = z.infer<typeof articleSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type LandingPageDTO = z.infer<typeof landingPageSchema>;
export type PersonDTO = z.infer<typeof personSchema>;
export type PropertyCategory = z.infer<typeof propertyCategorySchema>;
export type PropertyDealType = z.infer<typeof propertyDealTypeSchema>;
export type PropertyEnumWriteDTO = z.infer<typeof propertyEnumWriteSchema>;
export type SeoEntry = z.infer<typeof seoEntrySchema>;
