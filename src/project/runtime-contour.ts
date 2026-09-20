export const STAGING_CONTOUR = {
  publicHost: "more-previu.tw1.ru",
  databaseName: "default_db",
  s3Bucket: "moreigory-media",
  s3Prefix: "staging/media",
  secretProject: "more-i-gory-server/prod",
  databaseSecretName: "MOREIGORY_DATABASE_URL",
  forbiddenLeadSecretNames: ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "LEAD_CHANNELS"],
  jobsAutorun: "false",
  ingest: "frozen",
  robots: "noindex, nofollow",
} as const;

export type RuntimeContour = "staging" | "production";

export function resolveRuntimeContour(source: NodeJS.ProcessEnv = process.env): RuntimeContour | undefined {
  const value = source.AMS_RUNTIME_CONTOUR?.trim();
  if (value === "staging" || value === "production") return value;
  return undefined;
}

export function resolveS3MediaPrefix(source: {
  AMS_RUNTIME_CONTOUR?: string;
  S3_MEDIA_PREFIX?: string;
}): "media" | "staging/media" {
  const explicit = source.S3_MEDIA_PREFIX?.trim();
  if (explicit === "media" || explicit === "staging/media") return explicit;
  if (source.AMS_RUNTIME_CONTOUR === "staging") return "staging/media";
  return "media";
}
