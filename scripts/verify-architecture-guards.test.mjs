import assert from "node:assert/strict";
import test from "node:test";

import { assertArchitectureGuards, findArchitectureGuardViolations } from "./lib/architecture-guards.mjs";

const exactManifest = {
  dependencies: {
    "@more-i-gory/contracts": "workspace:*",
    zod: "4.6.1",
  },
};

const cleanContractsManifest = {
  dependencies: {
    zod: "4.6.1",
  },
};

const cleanUiManifest = {
  dependencies: {
    "@more-i-gory/contracts": "workspace:*",
    react: "19.3.0",
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
        { path: "packages/contracts/src/index.ts", content: 'import { z } from "zod"; export { pageSchema } from "./schemas.ts";' },
        { path: "packages/ui/src/index.ts", content: 'import type { PageContent } from "@more-i-gory/contracts"; export type UiPage = PageContent;' },
        { path: "src/components/marketing/layout.tsx", content: 'export const className = "grid grid-cols-[auto_1fr]";' },
      ],
      manifests: [
        { path: "package.json", manifest: exactManifest },
        { path: "packages/contracts/package.json", manifest: cleanContractsManifest },
        { path: "packages/ui/package.json", manifest: cleanUiManifest },
      ],
    }),
  );
});

test("Guard 1 rejects overrideAccess outside System Gateway", () => {
  assert.throws(
    () =>
      assertArchitectureGuards({
        files: [{ path: "src/app/api/public/route.ts", content: "const options = { overrideAccess: true };" }],
        manifests: [],
      }),
    /overrideAccess:true outside registered System Gateway/,
  );
});

test("Guard 1 rejects Local API call without explicit overrideAccess", () => {
  assert.throws(
    () =>
      assertArchitectureGuards({
        files: [{ path: "src/core/data-access/public/pages.ts", content: 'payload.find({ collection: "pages" });' }],
        manifests: [],
      }),
    /Local API call without explicit overrideAccess/,
  );
});

test("Guard 1 allows Public Gateway Local API with explicit overrideAccess false", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [
        {
          path: "src/core/data-access/public/pages.ts",
          content: 'payload.find({ collection: "pages", overrideAccess: false });',
        },
      ],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 rejects unregistered privileged files inside System Gateway", () => {
  expectGuard(1, {
    files: [{ path: "src/core/data-access/system/maintenance.ts", content: "const options = { overrideAccess: true };" }],
    manifests: [],
  });
});

test("Guard 1 allows registered lead delivery System Gateway transition", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/core/data-access/system/lead-delivery.ts", content: "const options = { overrideAccess: true };" }],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 allows registered lead retention System Gateway cleanup", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/core/data-access/system/lead-retention.ts", content: "const options = { overrideAccess: true };" }],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 allows registered jobs recovery System Gateway access", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/core/data-access/system/jobs.ts", content: "const options = { overrideAccess: true };" }],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 allows payload-jobs access only in the trusted jobs recovery module", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/core/data-access/system/jobs.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],
      manifests: [],
    }),
    [],
  );

  expectGuard(1, {
    files: [{ path: "src/core/data-access/system/lead-delivery.ts", content: 'payload.find({ collection: "payload-jobs", overrideAccess: true });' }],
    manifests: [],
  });
});

test("Guard 1 allows jobsCollectionOverrides as the owner read-only diagnostic route", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/project/jobs/config.ts", content: "export const config = { jobsCollectionOverrides: ({ defaultJobsCollection }) => defaultJobsCollection };" }],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 allows registered catalog lifecycle System Gateway access", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [{ path: "src/core/data-access/system/catalog-lifecycle.ts", content: "const options = { overrideAccess: true };" }],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 allows the two registered seed System Gateway owners", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [
        { path: "src/core/data-access/system/seed-media.ts", content: "const options = { overrideAccess: true };" },
        { path: "src/core/data-access/system/seed-regions.ts", content: "const options = { overrideAccess: true };" },
      ],
      manifests: [],
    }),
    [],
  );
});

test("Guard 1 rejects privileged access in executable operational scripts", () => {
  expectGuard(1, {
    files: [{ path: "scripts/example.mjs", content: "const options = { overrideAccess: true };" }],
    manifests: [],
  });
});

test("Guard 1 ignores tests and fixture strings when scanning scripts", () => {
  assert.deepEqual(
    findArchitectureGuardViolations({
      files: [
        { path: "scripts/example.test.mjs", content: "const options = { overrideAccess: true };" },
        { path: "scripts/example.mjs", content: 'const fixture = "overrideAccess:true";' },
      ],
      manifests: [],
    }),
    [],
  );
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

test("Guard 9 rejects framework runtime in contracts sources and manifest", () => {
  expectGuard(9, {
    files: [{ path: "packages/contracts/src/page.ts", content: 'import type { Metadata } from "next";' }],
    manifests: [{ path: "packages/contracts/package.json", manifest: { dependencies: { next: "16.3.4", zod: "4.6.1" } } }],
  });
});

test("Guard 9 rejects persistence and project data dependencies in ui", () => {
  expectGuard(9, {
    files: [{ path: "packages/ui/src/card.tsx", content: 'import { getPayload } from "payload"; import { env } from "@/project/env";' }],
    manifests: [{ path: "packages/ui/package.json", manifest: { dependencies: { payload: "3.89.0" } } }],
  });
});

test("Guard 9 rejects Payload and data-access imports in presentation components", () => {
  expectGuard(9, {
    files: [
      { path: "src/components/page-blocks/cms-page.tsx", content: 'import type { CmsPageDTO } from "@/core/data-access/public/cms-page-contract";' },
      { path: "src/ui/interactive/lead-form-client.tsx", content: 'import { env } from "@/project/env";' },
    ],
    manifests: [],
  });
});

test("Guard 9 allows DTO imports in presentation components", () => {
  assert.doesNotThrow(() =>
    assertArchitectureGuards({
      files: [
        { path: "src/components/page-blocks/cms-page.tsx", content: 'import type { CmsPageDTO } from "@/core/dto";' },
        { path: "src/components/layout/site-header.tsx", content: 'import type { SiteChrome } from "@/core/dto";' },
      ],
      manifests: [],
    }),
  );
});

test("Guard 10 rejects dark variants while dark mode is disabled", () => {
  expectGuard(10, {
    files: [{ path: "src/components/marketing/card.tsx", content: 'export const className = "bg-card dark:bg-background";' }],
    manifests: [],
  });
});

test("Guard 10 rejects a non-canonical dark foundation", () => {
  expectGuard(10, {
    files: [{ path: "src/app/(site)/globals.css", content: "@custom-variant dark (&:where(.dark, .dark *));" }],
    manifests: [],
  });
});

test("Guard 11 rejects raw design literals outside globals.css", () => {
  expectGuard(11, {
    files: [{ path: "src/components/marketing/card.tsx", content: 'export const className = "bg-[#ffffff] text-[20px]";' }],
    manifests: [],
  });
});

test("Guard 11 allows structural arbitrary values", () => {
  assert.doesNotThrow(() =>
    assertArchitectureGuards({
      files: [
        { path: "src/components/marketing/grid.tsx", content: 'export const className = "grid lg:grid-cols-[0.85fr_1.15fr] has-[>svg]:grid-cols-[auto_1fr]";' },
        { path: "src/ui/interactive/sheet.tsx", content: 'export const className = "translate-x-[2.5rem] max-w-[42rem]";' },
      ],
      manifests: [],
    }),
  );
});

test("Guard 12 rejects Payload imports from the SEO layer", () => {
  expectGuard(12, {
    files: [
      { path: "src/seo/sitemap-source.ts", content: 'import { getPayload } from "payload"; import config from "../../payload.config";' },
    ],
    manifests: [],
  });
});

test("Guard 13 rejects a public regions reader without a published predicate", () => {
  expectGuard(13, {
    files: [
      {
        path: "src/core/data-access/public/regions.ts",
        content: 'payload.find({ collection: "regions", overrideAccess: false, where: { slug: { exists: true } } });',
      },
    ],
    manifests: [],
  });
});

test("Guard 13 allows a public regions reader with a published predicate", () => {
  assert.doesNotThrow(() =>
    assertArchitectureGuards({
      files: [
        {
          path: "src/core/data-access/public/regions.ts",
          content: 'payload.find({ collection: "regions", overrideAccess: false, where: { status: { equals: "published" } } });',
        },
      ],
      manifests: [],
    }),
  );
});
