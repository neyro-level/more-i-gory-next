import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  codeOwnedRegionPolicies,
  payloadOwnedRegionFields,
  regionOwnership,
  seoRegistryOwnedFields,
} from "../src/content/regions/ownership.ts";

test("region ownership splits Payload content, code routing and SEO index policy", () => {
  assert.deepEqual(regionOwnership, {
    code: "routing/composition policy",
    payload: "domain/content owner",
    seoRegistry: "explicit index policy",
  });
  assert.equal(payloadOwnedRegionFields.includes("lead"), true);
  assert.equal(payloadOwnedRegionFields.includes("investmentThesis"), true);
  assert.equal(codeOwnedRegionPolicies.includes("path-from-route-identity-and-hierarchy"), true);
  assert.equal(seoRegistryOwnedFields.includes("index"), true);
  assert.equal(seoRegistryOwnedFields.includes("sitemap"), true);
});

test("ADR-006 records the same ownership split", () => {
  const adr = readFileSync("docs/adr/ADR-006-regions-collection.md", "utf8");
  assert.match(adr, /Payload = domain\/content owner/);
  assert.match(adr, /Code = routing\/composition policy/);
  assert.match(adr, /SEO registry = explicit index policy/);
});
