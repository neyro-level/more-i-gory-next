import { lookup } from "node:dns/promises";
import https from "node:https";
import { isIP } from "node:net";
import { Readable } from "node:stream";

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
  etag: string | null;
  lastModified: string | null;
  status: number;
}>;

export type SafeOutboundStreamResponse = Readonly<{
  body: AsyncIterable<Uint8Array>;
  contentType: string | null;
  etag: string | null;
  lastModified: string | null;
  status: number;
}>;

export interface SafeOutboundClient {
  request(request: SafeOutboundRequest): Promise<SafeOutboundResponse>;
  requestStream(request: SafeOutboundRequest): Promise<SafeOutboundStreamResponse>;
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
): Promise<readonly string[]> {
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

  return addresses;
}

export function pickPinnedAddress(addresses: readonly string[]): { address: string; family: 4 | 6 } {
  const ipv4 = addresses.find((address) => isIP(address) === 4);
  if (ipv4) return { address: ipv4, family: 4 };

  const ipv6 = addresses.find((address) => isIP(address) === 6);
  if (ipv6) return { address: ipv6, family: 6 };

  throw new SafeOutboundRequestError("outbound_address_not_allowed");
}

export function createPinnedLookup(addresses: readonly string[]) {
  const pinned = pickPinnedAddress(addresses);
  return function pinnedLookup(
    _hostname: string,
    _options: unknown,
    callback: (error: Error | null, address: string, family: 4 | 6) => void,
  ) {
    callback(null, pinned.address, pinned.family);
  };
}

function createPinnedHttpsFetch(lookupFn: ReturnType<typeof createPinnedLookup>): typeof fetch {
  return (async (input, init = {}) => {
    const url = input instanceof URL ? input : new URL(String(input));
    const method = init.method ?? "GET";
    const payload = init.body;

    return await new Promise<Response>((resolve, reject) => {
      const request = https.request(
        url,
        {
          headers: init.headers as Record<string, string> | undefined,
          lookup: lookupFn as typeof import("node:dns").lookup,
          method,
          servername: url.hostname,
          signal: init.signal ?? undefined,
        },
        (incoming) => {
          const headers = new Headers();
          for (const [key, value] of Object.entries(incoming.headers)) {
            if (value === undefined) continue;
            headers.append(key, Array.isArray(value) ? value.join(", ") : value);
          }
          resolve(new Response(Readable.toWeb(incoming) as ReadableStream<Uint8Array>, {
            headers,
            status: incoming.statusCode ?? 500,
          }));
        },
      );

      request.on("error", reject);
      if (payload) request.write(Buffer.from(payload as ArrayBuffer));
      request.end();
    });
  }) as typeof fetch;
}

function contentLength(response: Response): number | null {
  const value = response.headers.get("content-length");
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number(value);
}

async function readWithAbort(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  if (signal.aborted) throw new SafeOutboundRequestError("outbound_request_timeout");

  return await new Promise((resolve, reject) => {
    const onAbort = () => reject(new SafeOutboundRequestError("outbound_request_timeout"));
    signal.addEventListener("abort", onAbort, { once: true });
    reader.read().then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

function createLimitedBody(
  response: Response,
  maxBytes: number,
  controller: AbortController,
  clearRequestTimeout: () => void,
): AsyncIterable<Uint8Array> {
  return {
    async *[Symbol.asyncIterator]() {
      if (!response.body) {
        clearRequestTimeout();
        return;
      }

      const reader = response.body.getReader();
      let completed = false;
      let receivedBytes = 0;
      try {
        while (true) {
          const { done, value } = await readWithAbort(reader, controller.signal);
          if (done) {
            completed = true;
            return;
          }
          receivedBytes += value.byteLength;
          if (receivedBytes > maxBytes) {
            await reader.cancel("outbound_response_too_large");
            controller.abort();
            throw new SafeOutboundRequestError("outbound_response_too_large");
          }
          yield value;
        }
      } catch (error) {
        if (error instanceof SafeOutboundRequestError) throw error;
        throw new SafeOutboundRequestError(
          controller.signal.aborted ? "outbound_request_timeout" : "outbound_request_failed",
        );
      } finally {
        clearRequestTimeout();
        if (!completed) {
          try {
            await reader.cancel();
          } catch {
            // The transport may already be destroyed by the abort signal.
          }
        }
        reader.releaseLock();
      }
    },
  };
}

async function collectBody(bodyStream: AsyncIterable<Uint8Array>): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of bodyStream) {
    chunks.push(chunk);
    total += chunk.byteLength;
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

type OutboundMethod = NonNullable<SafeOutboundRequest["method"]>;

function nextRedirectRequest(
  status: number,
  method: OutboundMethod,
  body: Uint8Array | undefined,
): { method: OutboundMethod; body: Uint8Array | undefined } {
  if (status === 303) {
    return { method: "GET", body: undefined };
  }

  if (status === 301 || status === 302) {
    return { method: "GET", body: undefined };
  }

  if (status === 307 || status === 308) {
    return { method, body };
  }

  return { method, body };
}

const authLikeHeaderNames = new Set([
  "authorization",
  "cookie",
  "proxy-authorization",
  "x-api-key",
  "x-auth-token",
]);

function headersWithoutAuth(headers: Readonly<Record<string, string>> | undefined): Record<string, string> | undefined {
  if (!headers) return undefined;
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !authLikeHeaderNames.has(name.toLowerCase())),
  );
}

function isCrossHostRedirect(from: URL, to: URL): boolean {
  return normalizeHost(from.hostname) !== normalizeHost(to.hostname);
}

function bodyInit(body: Uint8Array | undefined): ArrayBuffer | undefined {
  if (!body) return undefined;
  const copy = new Uint8Array(body.byteLength);
  copy.set(body);
  return copy.buffer;
}

export function createSafeOutboundClient(config: SafeOutboundClientConfig): SafeOutboundClient {
  const allowedHosts = config.allowedHosts.map(normalizeHost);
  const fetchImpl = config.fetchImpl;
  const maxRedirects = config.maxRedirects ?? defaultMaxRedirects;
  const resolveHostAddresses = config.resolveHostAddresses ?? defaultResolveHostAddresses;

  async function requestStream(request: SafeOutboundRequest): Promise<SafeOutboundStreamResponse> {
      let url = new URL(request.url);
      let method: OutboundMethod = request.method ?? "GET";
      let body = request.body;
      let headers = request.headers ? { ...request.headers } : undefined;

      for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
        const addresses = await assertSafeUrl(url, { allowedHosts, resolveHostAddresses });
        const pinnedLookup = createPinnedLookup(addresses);
        const send = fetchImpl ?? createPinnedHttpsFetch(pinnedLookup);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), request.timeoutMs);
        const clearRequestTimeout = () => clearTimeout(timeout);

        let response: Response;
        try {
          response = await send(url, {
            body: method === "GET" ? undefined : bodyInit(body),
            headers,
            method,
            redirect: "manual",
            signal: controller.signal,
          });
        } catch {
          clearRequestTimeout();
          throw new SafeOutboundRequestError(
            controller.signal.aborted ? "outbound_request_timeout" : "outbound_request_failed",
          );
        }

        const nextUrl = redirectLocation(response, url);
        if (nextUrl) {
          clearRequestTimeout();
          await response.body?.cancel();
          if (isCrossHostRedirect(url, nextUrl)) {
            headers = headersWithoutAuth(headers);
          }
          const next = nextRedirectRequest(response.status, method, body);
          method = next.method;
          body = next.body;
          url = nextUrl;
          continue;
        }

        const declaredLength = contentLength(response);
        if (declaredLength !== null && declaredLength > request.maxResponseBytes) {
          clearRequestTimeout();
          await response.body?.cancel("outbound_response_too_large");
          controller.abort();
          throw new SafeOutboundRequestError("outbound_response_too_large");
        }

        return {
          body: createLimitedBody(response, request.maxResponseBytes, controller, clearRequestTimeout),
          contentType: response.headers.get("content-type"),
          etag: response.headers.get("etag"),
          lastModified: response.headers.get("last-modified"),
          status: response.status,
        };
      }

      throw new SafeOutboundRequestError("outbound_too_many_redirects");
  }

  return {
    async request(request) {
      const response = await requestStream(request);
      return { ...response, body: await collectBody(response.body) };
    },
    requestStream,
  };
}
