import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const leadForm = readFileSync("src/ui/interactive/lead-form-client.tsx", "utf8");

const primitives = [
  ["Input", "@/components/ui/input"],
  ["Textarea", "@/components/ui/textarea"],
  ["Button", "@/components/ui/button"],
  ["Checkbox", "@/components/ui/checkbox"],
  ["Field", "@/components/ui/field"],
  ["Label", "@/components/ui/label"],
];

test("lead form uses canonical shadcn primitives without native control markup", () => {
  for (const [name, spec] of primitives) {
    assert.match(leadForm, new RegExp(`from "${spec}"`));
    assert.match(leadForm, new RegExp(`<${name}\\b`));
  }

  assert.equal(leadForm.includes("<input"), false);
  assert.equal(leadForm.includes("<textarea"), false);
  assert.equal(leadForm.includes("<button"), false);
  assert.equal(leadForm.includes('type="checkbox"'), false);
  assert.match(leadForm, /fetch\("\/api\/public\/leads\/"/);
});
