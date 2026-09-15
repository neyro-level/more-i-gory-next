export type SafeOutboundRequest = Readonly<{
  maxResponseBytes: number;
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
