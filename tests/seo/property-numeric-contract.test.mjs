import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Properties } from "../../src/project/collections/properties.ts";
import { applyPropertyNumericDbContract } from "../../src/core/data-access/ingest/property-numeric-schema.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function field(name) {
  return Properties.fields.find((candidate) => candidate.name === name);
}

test("money and area keep application validation and overwrite existing Drizzle columns", () => {
  assert.equal(field("priceMinor").validate(12500000), true);
  assert.match(field("priceMinor").validate(12500000.5), /integer/);
  assert.equal(field("pricePerMeterMinor").validate(350000), true);
  assert.equal(field("totalArea").validate(42.35), true);
  assert.match(field("totalArea").validate(42.355), /two fractional digits/);

  let extension;
  const schema = { enums: {}, relations: {}, tables: { properties: {} } };
  assert.equal(
    applyPropertyNumericDbContract({
      extendTable: (value) => {
        extension = value;
      },
      schema,
    }),
    schema,
  );
  assert.deepEqual(
    Object.keys(extension.columns).sort(),
    ["kitchenArea", "livingArea", "priceMinor", "pricePerMeterMinor", "totalArea"],
  );
  assert.deepEqual(
    Object.values(extension.columns).map((column) => column.config.name).sort(),
    ["kitchen_area", "living_area", "price_minor", "price_per_meter_minor", "total_area"],
  );

  const config = readFileSync(path.join(root, "payload.config.ts"), "utf8");
  assert.match(config, /afterSchemaInit: \[applyPropertyNumericDbContract\]/);
  assert.doesNotMatch(config, /beforeSchemaInit: \[applyPropertyNumericDbContract\]/);

  const hookSource = readFileSync(path.join(root, "src/core/data-access/ingest/property-numeric-schema.ts"), "utf8");
  assert.doesNotMatch(hookSource, /price_minor:\s*integer/);
  assert.doesNotMatch(hookSource, /total_area:\s*numeric/);

  const migration = readFileSync(path.join(root, "migrations/20260918_184114_property_numeric.ts"), "utf8");
  assert.match(migration, /ALTER COLUMN "price_minor" SET DATA TYPE integer/);
  assert.match(migration, /ALTER COLUMN "total_area" SET DATA TYPE numeric\(10, 2\)/);
});
