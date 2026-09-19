export { publicMediaSchema } from "../../dto/media.ts";
export type { PublicMediaDTO } from "../../dto/media.ts";

export const publicMediaSourceFields = ["alt", "url", "width", "height"] as const;

export const cmsOnlyMediaFields = ["kind", "decorative", "caption", "sourceLabel", "sourceUrl"] as const;
