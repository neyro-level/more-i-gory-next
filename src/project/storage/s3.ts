import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

import type { parseProjectEnv } from "../env";
import { resolveS3MediaPrefix } from "../runtime-contour.ts";

type ProjectEnv = ReturnType<typeof parseProjectEnv>;

export const TIMEWEB_S3_CONTRACT = {
  endpoint: "https://s3.twcstorage.ru",
  forcePathStyle: true,
  hostname: "s3.twcstorage.ru",
  mediaPrefix: "media",
  stagingMediaPrefix: "staging/media",
  region: "ru-1",
} as const;

export function isS3StorageConfigured(env: ProjectEnv): boolean {
  return Boolean(env.S3_ENDPOINT && env.S3_REGION && env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY);
}

export function assertTimewebS3Compatibility(env: Pick<ProjectEnv, "S3_BUCKET" | "S3_ENDPOINT" | "S3_REGION">): void {
  let url: URL;
  try {
    url = new URL(String(env.S3_ENDPOINT ?? ""));
  } catch {
    throw new Error("S3_ENDPOINT must be an absolute URL for Timeweb S3.");
  }

  if (url.origin !== TIMEWEB_S3_CONTRACT.endpoint) {
    throw new Error(`S3_ENDPOINT must be ${TIMEWEB_S3_CONTRACT.endpoint}`);
  }
  if (url.pathname !== "" && url.pathname !== "/") {
    throw new Error("S3_ENDPOINT must not include a path; Timeweb S3 uses path-style addressing.");
  }
  if (env.S3_REGION !== TIMEWEB_S3_CONTRACT.region) {
    throw new Error(`S3_REGION must be ${TIMEWEB_S3_CONTRACT.region}`);
  }
  if (!env.S3_BUCKET || !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/u.test(env.S3_BUCKET)) {
    throw new Error("S3_BUCKET must be a valid bucket identity from runtime env.");
  }
}

export function createS3SdkConfig(env: ProjectEnv) {
  assertTimewebS3Compatibility(env);
  return {
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY as string,
      secretAccessKey: env.S3_SECRET_KEY as string,
    },
    endpoint: env.S3_ENDPOINT as string,
    forcePathStyle: TIMEWEB_S3_CONTRACT.forcePathStyle,
    region: env.S3_REGION as string,
  };
}

export function createPublicS3ObjectUrl(
  filename: string,
  bucket: string,
  prefix = TIMEWEB_S3_CONTRACT.mediaPrefix,
): string {
  assertTimewebS3Compatibility({ S3_BUCKET: bucket, S3_ENDPOINT: TIMEWEB_S3_CONTRACT.endpoint, S3_REGION: TIMEWEB_S3_CONTRACT.region });
  const name = filename.trim().replace(/^\/+/, "");
  if (!name || name.includes("..") || name.includes("\\")) {
    throw new Error("S3 object filename must be a safe relative object name.");
  }
  return `${TIMEWEB_S3_CONTRACT.endpoint}/${bucket}/${prefix}/${name}`;
}

export function isVpsDiskMediaSourceOfTruth(): false {
  return false;
}

export function createStoragePlugins(env: ProjectEnv): Plugin[] {
  const enabled = isS3StorageConfigured(env);
  const config = enabled ? createS3SdkConfig(env) : {};

  return [
    s3Storage({
      alwaysInsertFields: true,
      bucket: enabled ? (env.S3_BUCKET as string) : "schema-only-disabled",
      collections: {
        media: {
          prefix: resolveS3MediaPrefix(env),
        },
      },
      config,
      disableLocalStorage: true,
      enabled,
    }),
  ];
}
