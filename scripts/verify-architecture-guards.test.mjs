import assert from "node:assert/strict";
import test from "node:test";

import { assertArchitectureGuards } from "./lib/architecture-guards.mjs";

const exactManifest = {
  dependencies: {
    "@more-i-gory/contracts": "workspace:*",
    zod: "4.6.1",
  },
};

function expectGuard(guard, snapshot) {
  assert.throws(() => assertArchitectureGuards(snapshot), new RegExp(`Guard ${guard}:`));
}

test("clean architecture fixture passes all guards", () => {
  assert.doesNotThrow(() =>
    assertArchitectureGuards({
      files: [
        { path: "src/core/data-access/system/bootstrap-owner.ts", content: "export const options = { overrideAccess: true };" },
        { path: "src/project/env.ts", content: "export const secret = process.env.PAYLOAD_SECRET;" },
        { path: "next.config.ts", content: "export const bucket = process.env.S3_BUCKET; export const endpoint = process.env.S3_ENDPOINT;" },
      ],
      manifests: [{ path: "package.json", manifest: exactManifest }],
    }),
  );
});

test("Guard 1 rejects overrideAccess outside System Gateway", () => {
  expectGuard(1, {
    files: [{ path: "src/app/api/public/route.ts", content: "const options = { overrideAccess: true };" }],
    manifests: [],
  });
});

test("Guard 1 rejects unregistered privileged files inside System Gateway", () => {
  expectGuard(1, {
    files: [{ path: "src/core/data-access/system/maintenance.ts", content: "const options = { overrideAccess: true };" }],
    manifests: [],
  });
});

test("Guard 2 rejects low-level DB outside approved layers", () => {
  expectGuard(2, {
    files: [{ path: "src/app/api/public/route.ts", content: 'import postgres from "postgres";' }],
    manifests: [],
  });
});

test("Guard 3 rejects private fields in public contracts", () => {
  expectGuard(3, {
    files: [{ path: "packages/contracts/src/property.ts", content: "export type PropertyDTO = { cadastralNumber: string };" }],
    manifests: [],
  });
});

test("Guard 4 rejects wildcard CORS", () => {
  expectGuard(4, {
    files: [{ path: "payload.config.ts", content: 'export default { cors: ["*"] };' }],
    manifests: [],
  });
});

test("Guard 5 rejects package version ranges", () => {
  expectGuard(5, {
    files: [],
    manifests: [{ path: "package.json", manifest: { dependencies: { zod: "^4.6.1" } } }],
  });
});

test("Guard 6 rejects configurable fetch outside Safe Outbound Client", () => {
  expectGuard(6, {
    files: [{ path: "src/project/integration.ts", content: "export const send = (url) => fetch(url);" }],
    manifests: [],
  });
});

test("Guard 7 rejects process.env outside approved layer", () => {
  expectGuard(7, {
    files: [{ path: "src/core/leads/delivery.ts", content: "export const token = process.env.TELEGRAM_BOT_TOKEN;" }],
    manifests: [],
  });
});

test("Guard 7 rejects unrelated process.env access in next config", () => {
  expectGuard(7, {
    files: [{ path: "next.config.ts", content: "export const secret = process.env.PAYLOAD_SECRET;" }],
    manifests: [],
  });
});

test("Guard 8 rejects next/headers in jobs", () => {
  expectGuard(8, {
    files: [{ path: "src/project/jobs/delivery.ts", content: 'import { headers } from "next/headers";' }],
    manifests: [],
  });
});
