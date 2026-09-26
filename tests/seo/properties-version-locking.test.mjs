import assert from "node:assert/strict";
import test from "node:test";

import { Pages } from "../../src/project/collections/pages.ts";
import { Properties } from "../../src/project/collections/properties.ts";
import { Regions } from "../../src/project/collections/regions.ts";

test("properties keep versions, drafts and locking disabled for imported inventory", () => {
  assert.equal(Properties.versions, false);
  assert.equal(Properties.lockDocuments, false);
});

test("editorial pages and regions keep drafts and document locking enabled", () => {
  for (const collection of [Pages, Regions]) {
    assert.equal(collection.versions.drafts, true);
    assert.deepEqual(collection.lockDocuments, { duration: 300 });
  }
});
