import { z } from "zod";

const optionalNonEmpty = z.string().trim().min(1).optional();
const optionalUrl = z.url().optional();

const rawEnvSchema = z
  .object({
    AMS_PROFILE: z.literal("REALTY_BASE"),
    TZ: z.literal("Europe/Moscow"),
    AMS_RUNTIME_CONTOUR: z.enum(["staging", "production"]).optional(),
    JOBS_AUTORUN: z.enum(["true", "false"]).default("false"),
    DATABASE_URI: z
      .string()
      .trim()
      .refine((value) => value.startsWith("postgresql://") || value.startsWith("postgres://"), {
        message: "DATABASE_URI must be a PostgreSQL connection string",
      }),
    PAYLOAD_SECRET: z.string().min(32),
    NEXT_PUBLIC_SERVER_URL: z.url(),
    NEXT_PUBLIC_LEADS_ENABLED: z.enum(["true", "false"]).default("false"),
    CACHE_INVALIDATION_MODE: z.literal("http").optional(),
    REVALIDATE_SECRET: z.string().min(32).optional(),
    INTERNAL_REVALIDATE_BASE_URL: optionalUrl,
    S3_ENDPOINT: optionalUrl,
    S3_REGION: optionalNonEmpty,
    S3_BUCKET: optionalNonEmpty,
    S3_ACCESS_KEY: optionalNonEmpty,
    S3_SECRET_KEY: optionalNonEmpty,
    S3_MEDIA_PREFIX: z.enum(["media", "staging/media"]).optional(),
    OUTBOUND_ALLOWED_HOSTS: optionalNonEmpty,
    LEAD_CHANNELS: optionalNonEmpty,
    LEAD_OUTBOUND_HOSTS: optionalNonEmpty,
    TELEGRAM_BOT_TOKEN: optionalNonEmpty,
    TELEGRAM_CHAT_ID: optionalNonEmpty,
    ALERT_WEBHOOK_URL: optionalUrl,
  })
  .superRefine((value, context) => {
    if (value.CACHE_INVALIDATION_MODE === "http") {
      if (!value.REVALIDATE_SECRET) {
        context.addIssue({ code: "custom", message: "REVALIDATE_SECRET is required for HTTP invalidation", path: ["REVALIDATE_SECRET"] });
      }
      if (!value.INTERNAL_REVALIDATE_BASE_URL) {
        context.addIssue({ code: "custom", message: "INTERNAL_REVALIDATE_BASE_URL is required for HTTP invalidation", path: ["INTERNAL_REVALIDATE_BASE_URL"] });
      }
    }

    const s3Keys = ["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY"] as const;
    if (s3Keys.some((key) => value[key])) {
      for (const key of s3Keys) {
        if (!value[key]) context.addIssue({ code: "custom", message: `${key} is required when S3 is enabled`, path: [key] });
      }
    }

    const leadChannels = value.LEAD_CHANNELS?.split(",").map((channel) => channel.trim()).filter(Boolean) ?? [];
    if (leadChannels.includes("telegram")) {
      for (const key of ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"] as const) {
        if (!value[key]) context.addIssue({ code: "custom", message: `${key} is required for the Telegram lead channel`, path: [key] });
      }
    }

  });

export function isProductionRuntimeProfile(source: NodeJS.ProcessEnv): boolean {
  return (
    source.NODE_ENV === "production" &&
    source.NEXT_PHASE !== "phase-production-build" &&
    source.VERIFY_RUNTIME !== "1"
  );
}

export function parseProjectEnv(source: NodeJS.ProcessEnv) {
  const parsed = rawEnvSchema.parse(source);

  if (isProductionRuntimeProfile(source)) {
    const s3Keys = ["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY", "S3_SECRET_KEY"] as const;
    for (const key of s3Keys) {
      if (!parsed[key]) {
        throw new z.ZodError([
          {
            code: "custom",
            message: `${key} is required in the production profile`,
            path: [key],
          },
        ]);
      }
    }
  }

  return parsed;
}

export function lookupRuntimeEnv(name: string, source: NodeJS.ProcessEnv = process.env): string | undefined {
  const value = source[name];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = parseProjectEnv(process.env);
