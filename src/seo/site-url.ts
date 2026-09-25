import { lookupRuntimeEnv } from "../project/env.ts";

export function getSiteUrl(source: NodeJS.ProcessEnv = process.env): string {
  const raw = lookupRuntimeEnv("NEXT_PUBLIC_SERVER_URL", source);
  if (!raw) throw new Error("NEXT_PUBLIC_SERVER_URL is required to build absolute public URLs.");

  const url = new URL(raw);
  if (!/^https?:$/.test(url.protocol) || url.origin !== raw.replace(/\/$/, "")) {
    throw new Error("NEXT_PUBLIC_SERVER_URL must be an exact HTTP(S) origin.");
  }
  return url.origin;
}
