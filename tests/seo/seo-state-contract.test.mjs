import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { resolveSeoState } from "../../src/seo/seo-state.ts";

const registry = (overrides = {}) => ({ canonical: "/sample/", index: "yes", sitemap: "yes", ...overrides });

test("one pure resolver aligns registry gate, metadata robots and sitemap", () => {
  const gated = resolveSeoState({ canonical: "/sample/", publicationStatus: "published", registry: registry({ index: "gate", sitemap: "gate" }), runtimeContour: "production" });
  assert.deepEqual(gated, {
    canonical: "/sample/", follow: true, httpStatus: 200, index: false,
    reason: "registry-gate", redirectIntent: null, sitemap: false,
  });

  const active = resolveSeoState({ canonical: "/sample/", publicationStatus: "published", registry: registry(), runtimeContour: "production" });
  assert.equal(active.index, true);
  assert.equal(active.sitemap, true);
});

test("preview, technical, draft and noindex states never enter sitemap", () => {
  for (const input of [
    { preview: true },
    { technical: true },
    { publicationStatus: "draft" },
    { cmsSeo: { robots: "noindex-follow" } },
    { runtimeContour: "staging" },
  ]) {
    const state = resolveSeoState({ canonical: "/sample/", registry: registry(), ...input });
    assert.equal(state.index, false);
    assert.equal(state.sitemap, false);
  }
});

test("canonical override is internal-only and redirect remains an adapter intent", () => {
  const invalid = resolveSeoState({ canonical: "/sample/", cmsSeo: { canonicalOverride: "https://example.test/hijack" } });
  assert.equal(invalid.canonical, "/sample/");
  assert.equal(invalid.index, false);
  assert.equal(invalid.reason, "invalid-canonical-override");

  const redirected = resolveSeoState({ canonical: "/old/", redirectIntent: { status: 308, target: "/new" } });
  assert.deepEqual(redirected.redirectIntent, { status: 308, target: "/new/" });
  const source = readFileSync("src/seo/seo-state.ts", "utf8");
  assert.doesNotMatch(source, /redirect\(|permanentRedirect\(|notFound\(/);
});
