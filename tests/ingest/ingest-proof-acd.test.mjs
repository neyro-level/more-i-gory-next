import assert from "node:assert/strict";
import test from "node:test";

import { jobsJanitor } from "../../src/core/data-access/system/jobs-janitor.ts";
import { parseFeedByRegistry } from "../../src/core/ingest/parsers/registry.ts";
import { calculatePostRunNextDueAt } from "../../src/core/ingest/schedule-next-due.ts";
import { runImportFeedWithHeartbeat } from "../../src/project/jobs/imports/import-feed.ts";

function yrlOffers(ids) {
  const inner = ids
    .map((id) => `<offer id="${id}"><name>Offer ${id}</name></offer>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><yml_catalog><shop><offers>${inner}</offers></shop></yml_catalog>`;
}

function createProofWorld() {
  let nextPropertyId = 1;
  let nextIssueId = 1;
  const properties = [];
  const runs = new Map();
  const source = {
    deactivationApproval: {},
    feedUrlRef: "FEED_URL_PRIMARY",
    lastEtag: null,
    lastFeedHash: null,
    lastFullRunAt: null,
    lastModified: null,
    lastOfferCount: null,
    lastSuccessfulRunAt: null,
    market: "newbuild",
    maxDeactivationsPerRun: 20,
    parser: "yrl",
    refreshIntervalMinutes: 60,
    safetyThresholdPercent: 20,
  };

  function matchWhere(doc, where) {
    if (!where) return true;
    if (where.and) return where.and.every((part) => matchWhere(doc, part));
    if (where.or) return where.or.some((part) => matchWhere(doc, part));
    if (where.id?.equals != null) return String(doc.id) === String(where.id.equals);
    if (where.id?.in) return where.id.in.map(String).includes(String(doc.id));
    if (where.externalId?.equals != null) return doc.externalId === where.externalId.equals;
    if (where.feedSource?.equals != null) return String(doc.feedSource) === String(where.feedSource.equals);
    if (where.origin?.equals != null) return doc.origin === where.origin.equals;
    if (where.market?.equals != null) return doc.market === where.market.equals;
    if (where.status?.equals != null) return doc.status === where.status.equals;
    if (where.status?.in) return where.status.in.includes(doc.status);
    return true;
  }

  const payload = {
    async findByID(args) {
      if (args.collection === "import-runs") return runs.get(String(args.id)) ?? { mode: "full" };
      return source;
    },
    async find(args) {
      if (args.collection === "import-runs") {
        const docs = [...runs.values()]
          .filter((run) => matchWhere(run, args.where))
          .sort((left, right) => String(right.finishedAt ?? "").localeCompare(String(left.finishedAt ?? "")));
        return { docs, hasNextPage: false };
      }
      const docs = properties.filter((doc) => matchWhere(doc, args.where));
      return { docs, hasNextPage: false };
    },
    async create(args) {
      if (args.collection === "import-issues") {
        nextIssueId += 1;
        return { id: nextIssueId };
      }
      const created = { id: nextPropertyId, status: "active", ...args.data };
      nextPropertyId += 1;
      properties.push(created);
      return created;
    },
    async update(args) {
      if (args.collection === "feed-sources") {
        Object.assign(source, args.data);
        return { docs: [{ id: "101" }] };
      }
      if (args.collection === "import-runs") {
        const docs = [];
        for (const run of runs.values()) {
          if (args.id != null && String(run.id) !== String(args.id)) continue;
          if (args.where && !matchWhere(run, args.where)) continue;
          Object.assign(run, args.data);
          docs.push(run);
        }
        return { docs };
      }
      const docs = [];
      for (const doc of properties) {
        const idMatch = args.id != null && String(doc.id) === String(args.id);
        const whereMatch = args.where ? matchWhere(doc, args.where) : false;
        if (args.id != null ? idMatch : whereMatch) {
          Object.assign(doc, args.data);
          docs.push(doc);
        }
      }
      return { docs };
    },
  };

  return {
    payload,
    properties,
    runs,
    source,
    queueRun(id) {
      const run = { id, feedSource: "101", mode: "full", status: "queued" };
      runs.set(String(id), run);
      return run;
    },
    activeExternalIds() {
      return properties.filter((doc) => doc.status === "active").map((doc) => doc.externalId);
    },
  };
}

async function runImport(world, { runId, status, body, etag }) {
  world.queueRun(runId);
  return runImportFeedWithHeartbeat({
    input: { feedSourceId: "101", importRunId: String(runId) },
    lookupEnv: () => "https://feeds.example/primary.xml",
    outbound: {
      async requestStream() {
        const bytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
        return {
          body: (async function* () { if (bytes.byteLength > 0) yield bytes; })(),
          contentType: "application/xml",
          etag,
          lastModified: null,
          status,
        };
      },
    },
    payload: world.payload,
    setHeartbeatInterval: () => 1,
    clearHeartbeatInterval() {},
  });
}

test("Proof A/C/D: fixture ingest covers baseline, 304, change, safety gate, interrupt and recovery", async () => {
  const world = createProofWorld();
  const ten = Array.from({ length: 10 }, (_, index) => `keep-${index}`);
  const six = ten.slice(0, 6);
  const truncated = parseFeedByRegistry({
    parser: "yrl",
    xml: "<yml_catalog><shop><offers><offer id='gone'><name>Broken",
  });
  assert.equal(truncated.suspicious, true);

  const baseline = await runImport(world, {
    runId: "run-baseline",
    status: 200,
    etag: '"v1"',
    body: yrlOffers(ten),
  });
  assert.equal(baseline.status, "success");
  assert.equal(baseline.state.deactivation?.action, "skip");
  assert.equal(baseline.state.deactivation?.reason, "baseline");
  assert.equal(world.activeExternalIds().length, 10);
  assert.ok(world.source.lastFullRunAt);
  assert.ok(world.source.nextDueAt);

  const sameFeed = await runImport(world, {
    runId: "run-same",
    status: 200,
    etag: '"v2"',
    body: yrlOffers(ten),
  });
  assert.equal(sameFeed.status, "unchanged");
  assert.equal(sameFeed.completedStages.includes("upsert"), false);
  assert.equal(world.properties.filter((doc) => doc.origin === "feed").length, 10);

  const unchanged = await runImport(world, {
    runId: "run-304",
    status: 304,
    etag: '"v2"',
    body: new Uint8Array(),
  });
  assert.equal(unchanged.status, "unchanged");
  assert.equal(unchanged.completedStages.includes("upsert"), false);

  const changed = await runImport(world, {
    runId: "run-changed",
    status: 200,
    etag: '"v3"',
    body: yrlOffers(ten).replace("Offer keep-0", "Offer keep-0 updated"),
  });
  assert.equal(changed.status, "success");
  assert.ok((changed.state.upsert?.updatedCount ?? 0) >= 1);

  const missing = await runImport(world, {
    runId: "run-missing",
    status: 200,
    etag: '"v4"',
    body: yrlOffers(six),
  });
  assert.equal(missing.status, "suspicious");
  assert.equal(missing.state.deactivation?.action, "suspicious");
  assert.equal(world.properties.filter((doc) => doc.status === "archived").length, 0);

  world.source.deactivationApproval = {
    approvedAt: "2026-09-18T11:00:00.000Z",
    decision: "approved",
    expiresAt: "2027-12-31T23:59:59.000Z",
    runId: "run-approve",
  };
  const approved = await runImport(world, {
    runId: "run-approve",
    status: 200,
    etag: '"v5"',
    body: yrlOffers(six),
  });
  assert.equal(approved.status, "success");
  assert.equal(approved.state.deactivation?.action, "deactivate");
  assert.equal(world.properties.filter((doc) => doc.status === "archived").length, 4);
  assert.deepEqual(world.activeExternalIds().sort(), six);

  const cut = await runImport(world, {
    runId: "run-truncated",
    status: 200,
    etag: '"v6"',
    body: "<yml_catalog><shop><offers><offer id='gone'><name>Broken",
  });
  assert.equal(cut.status, "suspicious");
  assert.equal(world.properties.filter((doc) => doc.status === "archived").length, 4);
  assert.equal(world.runs.get("run-truncated").status, "suspicious");

  world.queueRun("run-killed");
  world.runs.get("run-killed").status = "running";
  world.runs.get("run-killed").startedAt = "2026-09-17T02:30:00.000Z";
  world.runs.get("run-killed").heartbeatAt = "2026-09-17T02:40:00.000Z";
  const janitor = await jobsJanitor(world.payload, new Date("2026-09-17T03:00:00.000Z"));
  assert.equal(janitor.staleRunning, 1);
  assert.equal(world.runs.get("run-killed").status, "interrupted");

  const recovered = await runImport(world, {
    runId: "run-recovered",
    status: 200,
    etag: '"v7"',
    body: yrlOffers(six),
  });
  assert.equal(recovered.status, "unchanged");
  assert.equal(world.runs.get("run-recovered").status, "unchanged");
  const nextDue = calculatePostRunNextDueAt({
    consecutiveFailures: 0,
    intervalMinutes: 60,
    now: new Date("2026-09-18T12:00:00.000Z"),
    outcome: "success",
  });
  assert.ok(nextDue.getTime() > Date.parse("2026-09-18T12:00:00.000Z"));
});
