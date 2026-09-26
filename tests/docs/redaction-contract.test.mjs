import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  REDACTED_VALUE,
  createRedactingLogger,
  redactLogContext,
  redactSensitiveText,
} from "../../src/core/security/redaction/index.ts";

const sensitiveMarkers = [
  "db-owner",
  "db-password",
  "lead@example.test",
  "+7 900 000-00-00",
  "Ольга",
  "Хочу объект у моря",
  "ZZBOTTOKEN",
  "ZZCHATID",
  "bearer-secret",
];

function assertRedacted(value) {
  const serialized = JSON.stringify(value);
  assert.match(serialized, /\[redacted\]/u);
  for (const marker of sensitiveMarkers) assert.equal(serialized.includes(marker), false, marker);
}

test("free-form diagnostics redact database URL credentials and common secret or PII shapes", () => {
  const raw = [
    "postgresql://db-owner:db-password@db.example.test:5432/default_db",
    "Authorization: Bearer bearer-secret",
    "https://api.telegram.org/botZZBOTTOKEN/sendMessage?token=ZZCHATID",
    "lead@example.test",
    "+7 900 000-00-00",
  ].join(" ");
  assertRedacted(redactSensitiveText(raw));
});

test("structured logger recursively removes sensitive fields before delegation", () => {
  const calls = [];
  const delegate = Object.fromEntries(
    ["debug", "error", "info", "warn"].map((level) => [level, (message, context) => calls.push({ context, level, message })]),
  );
  const logger = createRedactingLogger(delegate);
  logger.error("lead failed for lead@example.test", {
    DATABASE_URI: "postgresql://db-owner:db-password@db.example.test/default_db",
    nested: { botToken: "ZZBOTTOKEN", chatId: "ZZCHATID" },
    lead: { email: "lead@example.test", message: "Хочу объект у моря", name: "Ольга", phone: "+7 900 000-00-00" },
  });
  assertRedacted(calls);
  assert.equal(calls[0].context.lead.email, REDACTED_VALUE);
});

test("context redaction handles errors and circular references without throwing", () => {
  const context = { error: new Error("postgresql://db-owner:db-password@db.example.test/default_db") };
  context.self = context;
  assertRedacted(redactLogContext(context));
});

test("database operators never print raw caught error messages", () => {
  for (const file of [
    "ops/runtime/single-db-application-smoke.mjs",
    "ops/runtime/single-db-migration.mjs",
    "scripts/report-property-enum-drift.mjs",
    "scripts/seed-preview-db-proof.mjs",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /error\.message|String\(error\)/u, file);
    assert.match(source, /details redacted/u, file);
  }
});
