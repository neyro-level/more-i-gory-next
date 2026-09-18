import type { StructuredLogger } from "../observability/index.ts";

export const PUBLIC_READ_FAILED = "public_read_failed";

export type PublicReadFallbackIssue = Readonly<{
  code: typeof PUBLIC_READ_FAILED;
  reader: string;
}>;

const defaultLogger: Pick<StructuredLogger, "error"> = {
  error(message, context) {
    console.error(message, context);
  },
};

export async function publicReadWithFallback<T>(args: {
  fallback: T;
  logger?: Pick<StructuredLogger, "error">;
  read: () => Promise<T>;
  reader: string;
}): Promise<T> {
  try {
    return await args.read();
  } catch {
    const issue = {
      code: PUBLIC_READ_FAILED,
      reader: args.reader,
    } satisfies PublicReadFallbackIssue;
    (args.logger ?? defaultLogger).error("public read operational issue", issue);
    return args.fallback;
  }
}
