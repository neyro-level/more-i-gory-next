import type { LogContext, StructuredLogger } from "../../observability/index.ts";

export const PUBLIC_READ_FAILED = "public_read_failed";

export type PublicReadOperationalIssue = Readonly<{
  code: typeof PUBLIC_READ_FAILED;
  reader: string;
}>;

export class PublicReadOperationalError extends Error {
  readonly code = PUBLIC_READ_FAILED;
  readonly reader: string;

  constructor(reader: string, cause: unknown) {
    super(`Public read failed: ${reader}`, { cause });
    this.name = "PublicReadOperationalError";
    this.reader = reader;
  }
}

export function isPublicReadOperationalError(error: unknown): error is PublicReadOperationalError {
  return error instanceof PublicReadOperationalError;
}

const defaultLogger: Pick<StructuredLogger, "error"> = {
  error(message: string, context?: LogContext) {
    console.error(message, context);
  },
};

export async function publicReadOrThrow<T>(args: {
  logger?: Pick<StructuredLogger, "error">;
  read: () => Promise<T>;
  reader: string;
}): Promise<T> {
  try {
    return await args.read();
  } catch (cause) {
    const issue = {
      code: PUBLIC_READ_FAILED,
      reader: args.reader,
    } satisfies PublicReadOperationalIssue;
    (args.logger ?? defaultLogger).error("public read operational issue", issue);
    throw new PublicReadOperationalError(args.reader, cause);
  }
}
