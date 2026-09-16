import { s3Storage } from "@payloadcms/storage-s3";
import type { Plugin } from "payload";

import type { parseProjectEnv } from "../env";

type ProjectEnv = ReturnType<typeof parseProjectEnv>;

export function isS3StorageConfigured(env: ProjectEnv): boolean {
  return Boolean(env.S3_ENDPOINT && env.S3_REGION && env.S3_BUCKET && env.S3_ACCESS_KEY && env.S3_SECRET_KEY);
}

export function createStoragePlugins(env: ProjectEnv): Plugin[] {
  if (!isS3StorageConfigured(env)) return [];

  const s3 = {
    accessKey: env.S3_ACCESS_KEY as string,
    bucket: env.S3_BUCKET as string,
    endpoint: env.S3_ENDPOINT as string,
    region: env.S3_REGION as string,
    secretKey: env.S3_SECRET_KEY as string,
  };

  return [
    s3Storage({
      bucket: s3.bucket,
      collections: {
        media: {
          prefix: "media",
        },
      },
      config: {
        credentials: {
          accessKeyId: s3.accessKey,
          secretAccessKey: s3.secretKey,
        },
        endpoint: s3.endpoint,
        forcePathStyle: true,
        region: s3.region,
      },
      disableLocalStorage: true,
    }),
  ];
}
