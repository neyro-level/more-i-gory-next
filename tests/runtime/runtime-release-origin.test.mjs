import assert from "node:assert/strict";
import test from "node:test";

import { assertRuntimeReleaseOrigin } from "../../scripts/lib/runtime-release-origin.mjs";

test("runtime release accepts an explicit non-loopback target origin", () => {
  assert.equal(assertRuntimeReleaseOrigin({
    AMS_RUNTIME_CONTOUR: "staging",
    NEXT_PUBLIC_SERVER_URL: "https://preview.example.test",
  }), "https://preview.example.test");
});

test("runtime release rejects missing contour and loopback artifact origins", () => {
  assert.throws(() => assertRuntimeReleaseOrigin({ NEXT_PUBLIC_SERVER_URL: "https://preview.example.test" }), /explicit/);
  assert.throws(() => assertRuntimeReleaseOrigin({
    AMS_RUNTIME_CONTOUR: "staging",
    NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:4311",
  }), /non-loopback/);
});
