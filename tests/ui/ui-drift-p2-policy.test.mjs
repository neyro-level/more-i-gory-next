import assert from "node:assert/strict";
import test from "node:test";

import { evaluateUiDriftGate } from "../../scripts/lib/ui-drift-policy.mjs";

test("P0 and P1 UI drift findings are blocking", () => {
  const p0 = evaluateUiDriftGate([{ severity: "P0", file: "a.tsx", rule: "token" }]);
  const p1 = evaluateUiDriftGate([{ severity: "P1", file: "b.tsx", rule: "color" }]);

  assert.equal(p0.ok, false);
  assert.equal(p0.blocking, true);
  assert.equal(p1.ok, false);
  assert.equal(p1.blocking, true);
});

test("P2 UI drift findings are reported as backlog and do not fail the gate", () => {
  const gate = evaluateUiDriftGate([
    { severity: "P2", file: "c.tsx", rule: "arbitrary system value" },
    { severity: "P2", file: "d.tsx", rule: "raw project typography size" },
  ]);

  assert.equal(gate.ok, true);
  assert.equal(gate.blocking, false);
  assert.equal(gate.backlogFindings.length, 2);
  assert.match(gate.message, /P2 findings are backlog candidates/);
});
