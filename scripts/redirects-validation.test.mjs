import assert from "node:assert/strict";
import test from "node:test";

import { normalizeRedirectPath, validateRedirectEntries } from "../src/project/redirects/validation.ts";

const knownTargets = new Set(["/", "/new/", "/final/"]);

test("redirect paths are normalized to trailing slash internals", () => {
  assert.equal(normalizeRedirectPath("/old"), "/old/");
  assert.equal(normalizeRedirectPath("/old/"), "/old/");
  assert.equal(normalizeRedirectPath("/"), "/");
});

test("redirect validation rejects duplicate source, loop, chain and missing target", () => {
  assert.throws(
    () => validateRedirectEntries([
      { source: "/old/", destination: "/new/", permanent: true },
      { source: "/old", destination: "/final/", permanent: true },
    ], knownTargets),
    /Duplicate redirect source/,
  );

  assert.throws(
    () => validateRedirectEntries([{ source: "/old/", destination: "/old/", permanent: true }], knownTargets),
    /Redirect loop/,
  );

  assert.throws(
    () => validateRedirectEntries([
      { source: "/old/", destination: "/new/", permanent: true },
      { source: "/new/", destination: "/final/", permanent: true },
    ], knownTargets),
    /Redirect chain/,
  );

  assert.throws(
    () => validateRedirectEntries([{ source: "/old/", destination: "/missing/", permanent: true }], knownTargets),
    /not a known target/,
  );
});

test("redirect validation accepts a direct redirect to a known target", () => {
  assert.doesNotThrow(() =>
    validateRedirectEntries([{ source: "/old/", destination: "/new/", permanent: true }], knownTargets),
  );
});
