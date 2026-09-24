import assert from "node:assert/strict";
import test from "node:test";

import {
  MANUAL_PUBLICATION_MIN_FACTS,
  MANUAL_PUBLICATION_MIN_SOURCES,
  isManualPublicationAttempt,
  manualPublicationGateError,
  mergeManualPublicationRecord,
} from "../src/core/catalog/manual-publication-invariants.ts";
import { Properties } from "../src/project/collections/properties.ts";

const completeManual = {
  origin: "manual",
  slug: "yalta-passport",
  publishedAt: "2026-09-18T00:00:00.000Z",
  region: 1,
  verifiedAt: "2026-09-18T00:00:00.000Z",
  verdict: "Подходит для ручного инвестиционного разбора.",
  riskSummary: "Риск проверяется в паспорте.",
  sources: [{ label: "Открытые данные объекта" }],
  facts: [{ label: "Документы", value: "Проверяются перед публикацией." }],
};

test("unpublished manual drafts are not publication attempts", () => {
  assert.equal(isManualPublicationAttempt({ origin: "manual" }), false);
  assert.equal(manualPublicationGateError({ origin: "manual", slug: "draft" }), null);
});

test("feed origin is not gated by the manual publication contract", () => {
  assert.equal(
    manualPublicationGateError({
      origin: "feed",
      publishedAt: "2026-09-18T00:00:00.000Z",
    }),
    null,
  );
});

test("published manual passports require geo, slug, dates, verdict, riskSummary, sources and facts", () => {
  assert.equal(MANUAL_PUBLICATION_MIN_SOURCES, 1);
  assert.equal(MANUAL_PUBLICATION_MIN_FACTS, 1);
  assert.match(manualPublicationGateError({ origin: "manual", publishedAt: "2026-09-18" }) ?? "", /slug/);
  assert.match(manualPublicationGateError({ ...completeManual, region: null }) ?? "", /region relation/);
  assert.match(
    manualPublicationGateError({ ...completeManual, verifiedAt: null }) ?? "",
    /verifiedAt/,
  );
  assert.match(manualPublicationGateError({ ...completeManual, verdict: "  " }) ?? "", /verdict/);
  assert.match(manualPublicationGateError({ ...completeManual, riskSummary: "" }) ?? "", /riskSummary/);
  assert.match(manualPublicationGateError({ ...completeManual, sources: [] }) ?? "", /source/);
  assert.match(manualPublicationGateError({ ...completeManual, facts: [{ label: "X" }] }) ?? "", /facts/);
  assert.equal(manualPublicationGateError(completeManual), null);
});

test("partial updates keep previously stored publication fields", () => {
  const merged = mergeManualPublicationRecord(completeManual, { title: "Updated" });
  assert.equal(manualPublicationGateError(merged), null);
});

test("properties collection enforces the manual publication gate before validate", () => {
  const hook = Properties.hooks?.beforeValidate?.[1];
  assert.equal(typeof hook, "function");
  assert.throws(
    () => hook({ data: { origin: "manual", publishedAt: "2026-09-18T00:00:00.000Z" }, originalDoc: undefined }),
    /slug/,
  );
  const saved = hook({ data: completeManual, originalDoc: undefined });
  assert.equal(saved.origin, "manual");
  const merged = hook({
    data: { title: "Updated title" },
    originalDoc: completeManual,
  });
  assert.equal(merged.title, "Updated title");
});
