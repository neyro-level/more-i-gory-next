import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Properties } from "../src/project/collections/properties.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function field(name) {
  return Properties.fields.find((candidate) => candidate.name === name);
}

test("money and area keep application validation and are remapped in the Postgres schema hook", () => {
  assert.equal(field("priceMinor").validate(12500000), true);
  assert.match(field("priceMinor").validate(12500000.5), /integer/);
  assert.equal(field("pricePerMeterMinor").validate(350000), true);
  assert.equal(field("totalArea").validate(42.35), true);
  assert.match(field("totalArea").validate(42.355), /two fractional digits/);

  const hookSource = readFileSync(path.join(root, "src/core/data-access/ingest/property-numeric-schema.ts"), "utf8");
  assert.match(hookSource, /integer\("price_minor"\)/);
  assert.match(hookSource, /integer\("price_per_meter_minor"\)/);
  assert.match(hookSource, /numeric\("total_area", \{ mode: "number", precision: 10, scale: 2 \}\)/);
  assert.match(hookSource, /numeric\("living_area", \{ mode: "number", precision: 10, scale: 2 \}\)/);
  assert.match(hookSource, /numeric\("kitchen_area", \{ mode: "number", precision: 10, scale: 2 \}\)/);

  const migration = readFileSync(path.join(root, "migrations/20260918_184114_property_numeric.ts"), "utf8");
  assert.match(migration, /ALTER COLUMN "price_minor" SET DATA TYPE integer/);
  assert.match(migration, /ALTER COLUMN "total_area" SET DATA TYPE numeric\(10, 2\)/);
});
