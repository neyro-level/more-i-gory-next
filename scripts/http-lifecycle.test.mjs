import assert from "node:assert/strict";
import test from "node:test";

import {
  getRedirectStatusCodeFromError,
  getURLFromRedirectError,
} from "next/dist/client/components/redirect.js";
import {
  getAccessFallbackHTTPStatus,
  isHTTPAccessFallbackError,
} from "next/dist/client/components/http-access-fallback/http-access-fallback.js";

import { goneHttpFallbackStatus, materializeSeoHttpState } from "../src/seo/http-lifecycle.ts";
import { resolveSeoState } from "../src/seo/seo-state.ts";

test("gone SEO intent materializes as a real framework 404 instead of fake 200/410 markup", () => {
  const state = resolveSeoState({ canonical: "/obekty/gone/", lifecycle: "gone" });
  assert.equal(state.httpStatus, 410);
  assert.equal(goneHttpFallbackStatus, 404);

  assert.throws(() => materializeSeoHttpState(state), (error) => {
    assert.equal(isHTTPAccessFallbackError(error), true);
    assert.equal(getAccessFallbackHTTPStatus(error), 404);
    return true;
  });
});

test("permanent Next route redirect materializes as 308 with the normalized target", () => {
  const state = resolveSeoState({
    canonical: "/obekty/old/",
    redirectIntent: { status: 308, target: "/obekty/new" },
  });

  assert.throws(() => materializeSeoHttpState(state), (error) => {
    assert.equal(getRedirectStatusCodeFromError(error), 308);
    assert.equal(getURLFromRedirectError(error), "/obekty/new/");
    return true;
  });
});

test("indexable HTTP 200 state does not trigger navigation transport", () => {
  const state = resolveSeoState({ canonical: "/obekty/current/" });
  assert.doesNotThrow(() => materializeSeoHttpState(state));
});
