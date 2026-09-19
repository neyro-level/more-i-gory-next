import { getMediaAsset } from "../../../content/media/media-assets.ts";
import { publicMediaSchema, type PublicMediaDTO } from "./media-contract.ts";

export const CANONICAL_MISSING_IMAGE_ID = "media-og-default";

const asset = getMediaAsset(CANONICAL_MISSING_IMAGE_ID);

if (!asset) {
  throw new Error(`Canonical missing-image asset ${CANONICAL_MISSING_IMAGE_ID} is required.`);
}

export const CANONICAL_MISSING_IMAGE: PublicMediaDTO = publicMediaSchema.parse({
  alt: asset.alt,
  height: asset.height,
  src: asset.src,
  width: asset.width,
});

export function publicMediaOrFallback(input: {
  alt?: string | null;
  height?: number | null;
  src?: string | null;
  titleFallback?: string;
  width?: number | null;
}): PublicMediaDTO {
  const src = input.src?.trim();
  if (!src) return CANONICAL_MISSING_IMAGE;

  return publicMediaSchema.parse({
    alt: input.alt?.trim() || input.titleFallback || CANONICAL_MISSING_IMAGE.alt,
    height: input.height ?? CANONICAL_MISSING_IMAGE.height,
    src,
    width: input.width ?? CANONICAL_MISSING_IMAGE.width,
  });
}
