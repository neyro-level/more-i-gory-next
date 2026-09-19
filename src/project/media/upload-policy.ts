export const MEDIA_CONTENT_KINDS = ["region", "project", "complex", "og"] as const;
export const MEDIA_UI_KIND = "ui" as const;

export const MEDIA_UPLOAD_POLICY = {
  allowedMimeTypes: ["image/avif", "image/jpeg", "image/png", "image/webp"] as const,
  imageOnly: true,
  maxFileSizeBytes: 8 * 1024 * 1024,
} as const;

export type MediaUploadFileInput = {
  mimetype?: unknown;
  size?: unknown;
};

export type MediaUploadDocumentInput = {
  decorative?: unknown;
  kind?: unknown;
};

export function isAllowedMediaMimeType(value: string): boolean {
  return (MEDIA_UPLOAD_POLICY.allowedMimeTypes as readonly string[]).includes(value);
}

export function assertMediaUploadFile(file: MediaUploadFileInput): void {
  const mimetype = typeof file.mimetype === "string" ? file.mimetype : "";
  const size = typeof file.size === "number" ? file.size : Number.NaN;

  if (!isAllowedMediaMimeType(mimetype)) {
    throw new Error(
      `Media uploads allow only raster images: ${MEDIA_UPLOAD_POLICY.allowedMimeTypes.join(", ")}.`,
    );
  }

  if (!Number.isFinite(size) || size <= 0) {
    throw new Error("Media upload must include a positive file size.");
  }

  if (size > MEDIA_UPLOAD_POLICY.maxFileSizeBytes) {
    throw new Error(`Media upload exceeds the ${MEDIA_UPLOAD_POLICY.maxFileSizeBytes} byte limit.`);
  }
}

export function assertMediaKindPolicy(input: MediaUploadDocumentInput): void {
  const kind = input.kind;
  const decorative = input.decorative === true;

  if (kind === MEDIA_UI_KIND) return;
  if ((MEDIA_CONTENT_KINDS as readonly string[]).includes(String(kind)) && decorative) {
    throw new Error("Decorative media is allowed only for UI assets.");
  }
}
