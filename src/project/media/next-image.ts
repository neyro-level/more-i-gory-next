import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const S3_MEDIA_PREFIXES = ["media", "staging/media"] as const;

export function createS3MediaRemotePatterns(source: Partial<Record<"S3_BUCKET" | "S3_ENDPOINT", string | undefined>>): RemotePattern[] {
  const endpoint = source.S3_ENDPOINT?.trim();
  const bucket = source.S3_BUCKET?.trim();

  if (!endpoint || !bucket) return [];
  if (bucket.includes("*") || bucket.includes("/")) {
    throw new Error("S3_BUCKET must be an exact bucket name without wildcards or path separators.");
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("S3_ENDPOINT must be an absolute HTTP(S) URL for next/image remotePatterns.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("S3_ENDPOINT must use http or https for next/image remotePatterns.");
  }
  if (url.hostname.includes("*")) {
    throw new Error("S3_ENDPOINT host must be exact; wildcard hosts are forbidden.");
  }
  if (url.pathname !== "" && url.pathname !== "/") {
    throw new Error("S3_ENDPOINT must not include a path; media path is derived from S3_BUCKET and the media prefix.");
  }

  return S3_MEDIA_PREFIXES.map((prefix) => ({
    hostname: url.hostname,
    pathname: `/${bucket}/${prefix}/**`,
    port: url.port,
    protocol: url.protocol.slice(0, -1) as "http" | "https",
  }));
}
