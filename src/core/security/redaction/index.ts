import type { LogContext, StructuredLogger } from "../../observability/index.ts";

export type Redactor = (value: unknown) => unknown;

export const REDACTED_VALUE = "[redacted]";

const sensitiveKeys = new Set([
  "authorization",
  "bottoken",
  "chatid",
  "cookie",
  "databaseuri",
  "databaseurl",
  "email",
  "leadname",
  "message",
  "name",
  "passphrase",
  "password",
  "phone",
  "secret",
  "token",
]);

function isSensitiveKey(key: string): boolean {
  const normalized = key.replace(/[^a-z0-9]/giu, "").toLowerCase();
  return sensitiveKeys.has(normalized) || /(?:email|message|password|phone|secret|token)$/u.test(normalized);
}

export function redactSensitiveText(value: string): string {
  return value
    .replace(/([a-z][a-z0-9+.-]*:\/\/)([^\s/:@]+):([^\s/@]+)@/giu, `$1${REDACTED_VALUE}:${REDACTED_VALUE}@`)
    .replace(/\bBearer\s+[^\s,;]+/giu, `Bearer ${REDACTED_VALUE}`)
    .replace(/\/bot[^\s/?#]+/giu, `/bot${REDACTED_VALUE}`)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, REDACTED_VALUE)
    .replace(/(?:\+\d[\d ()-]{7,}\d|\d[ (][\d ()-]{6,}\d)/gu, REDACTED_VALUE)
    .replace(/([?&](?:access_token|api_key|password|secret|token)=)[^&#\s]*/giu, `$1${REDACTED_VALUE}`);
}

function redactValue(value: unknown, key: string | undefined, seen: WeakSet<object>): unknown {
  if (key && isSensitiveKey(key)) return REDACTED_VALUE;
  if (typeof value === "string") return redactSensitiveText(value);
  if (value instanceof Error) return { message: REDACTED_VALUE, name: value.name };
  if (Array.isArray(value)) return value.map((entry) => redactValue(entry, undefined, seen));
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[circular]";

  seen.add(value);
  const result: Record<string, unknown> = {};
  for (const [entryKey, entryValue] of Object.entries(value)) {
    result[entryKey] = redactValue(entryValue, entryKey, seen);
  }
  return result;
}

export function redactLogContext(context: LogContext | undefined): LogContext | undefined {
  if (!context) return undefined;
  return redactValue(context, undefined, new WeakSet()) as LogContext;
}

export function createRedactingLogger(logger: StructuredLogger): StructuredLogger {
  const write = (level: keyof StructuredLogger) => (message: string, context?: LogContext) => {
    logger[level](redactSensitiveText(message), redactLogContext(context));
  };
  return {
    debug: write("debug"),
    error: write("error"),
    info: write("info"),
    warn: write("warn"),
  };
}
