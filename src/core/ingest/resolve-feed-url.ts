export const feedUrlRefNamePattern = /^[A-Z][A-Z0-9_]*$/;

export class FeedUrlResolveError extends Error {
  readonly safeCode: string;

  constructor(safeCode: string, message: string) {
    super(message);
    this.name = "FeedUrlResolveError";
    this.safeCode = safeCode;
  }
}

function looksLikeUrl(value: string): boolean {
  return /:\/\//.test(value) || value.includes("/") || /^https?:/i.test(value);
}

export function validateFeedUrlRef(value: unknown): true | string {
  if (value == null || value === "") return true;
  if (typeof value !== "string") return "feedUrlRef must be an env name, not a URL.";
  const name = value.trim();
  if (looksLikeUrl(name) || !feedUrlRefNamePattern.test(name)) {
    return "feedUrlRef must be an env name, not a URL.";
  }
  return true;
}

export async function resolveFeedUrlFromRuntimeEnv(args: {
  feedUrlRef: string | null | undefined;
  lookup: (name: string) => string | undefined | Promise<string | undefined>;
}): Promise<string> {
  if (typeof args.feedUrlRef !== "string" || args.feedUrlRef.trim().length === 0) {
    throw new FeedUrlResolveError("feed_url_ref_missing", "feedUrlRef is not set.");
  }

  const name = args.feedUrlRef.trim();
  const nameCheck = validateFeedUrlRef(name);
  if (nameCheck !== true) {
    throw new FeedUrlResolveError("feed_url_ref_invalid", nameCheck);
  }

  const value = (await args.lookup(name))?.trim();
  if (!value) {
    throw new FeedUrlResolveError("feed_url_env_missing", `Runtime env ${name} is not set.`);
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new FeedUrlResolveError("feed_url_env_invalid", `Runtime env ${name} is not a valid URL.`);
  }

  return value;
}

export function createResolveFeedUrlHandler(deps: {
  loadFeedUrlRef: (feedSourceId: string) => Promise<string | null | undefined>;
  lookupEnv: (name: string) => string | undefined | Promise<string | undefined>;
}) {
  return async (context: {
    input: { feedSourceId: string };
    state: { feedUrl?: string };
  }) => {
    try {
      const feedUrlRef = await deps.loadFeedUrlRef(context.input.feedSourceId);
      context.state.feedUrl = await resolveFeedUrlFromRuntimeEnv({
        feedUrlRef,
        lookup: deps.lookupEnv,
      });
      return { continue: true, status: "running" as const };
    } catch (error) {
      if (error instanceof FeedUrlResolveError) {
        return { continue: false, status: "failed" as const };
      }
      throw error;
    }
  };
}
