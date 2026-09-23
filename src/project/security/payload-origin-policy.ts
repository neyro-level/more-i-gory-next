export type PayloadOriginPolicy = {
  cors: string[];
  csrf: string[];
  serverURL: string;
};

export function resolveExactHttpOrigin(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SERVER_URL must be an absolute HTTP(S) origin.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SERVER_URL must use HTTP or HTTPS.");
  }

  if (value !== url.origin) {
    throw new Error("NEXT_PUBLIC_SERVER_URL must be an exact origin without credentials, path, query, hash, or trailing slash.");
  }

  return url.origin;
}

export function createPayloadOriginPolicy(serverURL: string): PayloadOriginPolicy {
  const origin = resolveExactHttpOrigin(serverURL);

  return {
    cors: [origin],
    csrf: [origin],
    serverURL: origin,
  };
}
