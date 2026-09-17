import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type SafeOutboundRequest = Readonly<{
  body?: Uint8Array;
  headers?: Readonly<Record<string, string>>;
  maxResponseBytes: number;
  method?: "GET" | "POST";
  timeoutMs: number;
  url: URL;
}>;

export type SafeOutboundResponse = Readonly<{
  body: Uint8Array;
  contentType: string | null;
  status: number;
}>;

export interface SafeOutboundClient {
  request(request: SafeOutboundRequest): Promise<SafeOutboundResponse>;
}

export type SafeOutboundClientConfig = Readonly<{
  allowedHosts: readonly string[];
  fetchImpl?: typeof fetch;
  maxRedirects?: number;
  resolveHostAddresses?: (hostname: string) => Promise<readonly string[]>;
}>;

export class SafeOutboundRequestError extends Error {
  readonly safeCode: string;

  constructor(safeCode: string, message = "Safe outbound request rejected.") {
    super(message);
    this.name = "SafeOutboundRequestError";
    this.safeCode = safeCode;
  }
}

const defaultMaxRedirects = 3;

function normalizeHost(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

function isAllowedHost(hostname: string, allowedHosts: readonly string[]): boolean {
  const normalized = normalizeHost(hostname);
  return allowedHosts.map(normalizeHost).includes(normalized);
}

function isForbiddenIpAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [first = 0, second = 0] = address.split(".").map((part) => Number.parseInt(part, 10));
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first === 169 && second === 254 ||
      first === 172 && second >= 16 && second <= 31 ||
      first === 192 && second === 168 ||
      first === 100 && second >= 64 && second <= 127
    );
  }

  if (version === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return true;
}

async function defaultResolveHostAddresses(hostname: string): Promise<readonly string[]> {
  if (isIP(hostname)) return [hostname];
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => record.address);
}

async function assertSafeUrl(
  url: URL,
  config: Required<Pick<SafeOutboundClientConfig, "allowedHosts" | "resolveHostAddresses">>,
) {
  if (url.protocol !== "https:") {
    throw new SafeOutboundRequestError("outbound_non_https");
  }

  if (!isAllowedHost(url.hostname, config.allowedHosts)) {
    throw new SafeOutboundRequestError("outbound_host_not_allowed");
  }

  const addresses = await config.resolveHostAddresses(url.hostname);
  if (addresses.length === 0 || addresses.some(isForbiddenIpAddress)) {
    throw new SafeOutboundRequestError("outbound_address_not_allowed");
  }
}

async function readLimitedBody(response: Response, maxBytes: number): Promise<Uint8Array> {
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new SafeOutboundRequestError("outbound_response_too_large");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function redirectLocation(response: Response, currentUrl: URL): URL | null {
  if (![301, 302, 303, 307, 308].includes(response.status)) return null;
  const location = response.headers.get("location");
  return location ? new URL(location, currentUrl) : null;
}

function bodyInit(body: Uint8Array | undefined): ArrayBuffer | undefined {
  if (!body) return undefined;
  const copy = new Uint8Array(body.byteLength);
  copy.set(body);
  return copy.buffer;
}

export function createSafeOutboundClient(config: SafeOutboundClientConfig): SafeOutboundClient {
  const allowedHosts = config.allowedHosts.map(normalizeHost);
  const fetchImpl = config.fetchImpl ?? fetch;
  const maxRedirects = config.maxRedirects ?? defaultMaxRedirects;
  const resolveHostAddresses = config.resolveHostAddresses ?? defaultResolveHostAddresses;

  return {
    async request(request) {
      let url = new URL(request.url);

      for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
        await assertSafeUrl(url, { allowedHosts, resolveHostAddresses });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

        let response: Response;
        try {
          response = await fetchImpl(url, {
            body: bodyInit(request.body),
            headers: request.headers,
            method: request.method ?? "GET",
            redirect: "manual",
            signal: controller.signal,
          });
        } catch {
          throw new SafeOutboundRequestError("outbound_request_failed");
        } finally {
          clearTimeout(timeout);
        }

        const nextUrl = redirectLocation(response, url);
        if (nextUrl) {
          url = nextUrl;
          continue;
        }

        return {
          body: await readLimitedBody(response, request.maxResponseBytes),
          contentType: response.headers.get("content-type"),
          status: response.status,
        };
      }

      throw new SafeOutboundRequestError("outbound_too_many_redirects");
    },
  };
}
