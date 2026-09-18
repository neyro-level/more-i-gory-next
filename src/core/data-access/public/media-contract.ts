import { z } from "zod";

export const publicMediaSchema = z.object({
  alt: z.string().min(1),
  height: z.number().int().positive(),
  src: z.union([z.string().startsWith("/"), z.string().url()]),
  width: z.number().int().positive(),
});

export type PublicMediaDTO = z.infer<typeof publicMediaSchema>;

export const publicMediaSourceFields = ["alt", "url", "width", "height"] as const;

export const cmsOnlyMediaFields = ["kind", "decorative", "caption", "sourceLabel", "sourceUrl"] as const;
