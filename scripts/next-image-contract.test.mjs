import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createS3MediaRemotePatterns } from "../src/project/media/next-image.ts";

test("next/image remotePatterns allow only the exact approved S3 host and media prefix", () => {
  assert.deepEqual(
    createS3MediaRemotePatterns({
      S3_BUCKET: "moreigori-media",
      S3_ENDPOINT: "https://s3.timeweb.cloud",
    }),
    [
      {
        hostname: "s3.timeweb.cloud",
        pathname: "/moreigori-media/media/**",
        port: "",
        protocol: "https",
      },
    ],
  );
});

test("next/image remotePatterns stay disabled until S3 endpoint and bucket are configured together", () => {
  assert.deepEqual(createS3MediaRemotePatterns({}), []);
  assert.deepEqual(createS3MediaRemotePatterns({ S3_ENDPOINT: "https://s3.timeweb.cloud" }), []);
  assert.deepEqual(createS3MediaRemotePatterns({ S3_BUCKET: "moreigori-media" }), []);
});

test("next/image remotePatterns reject wildcard hosts and bucket paths", () => {
  assert.throws(
    () => createS3MediaRemotePatterns({ S3_BUCKET: "moreigori-media", S3_ENDPOINT: "https://*.timeweb.cloud" }),
    /wildcard hosts are forbidden/,
  );
  assert.throws(
    () => createS3MediaRemotePatterns({ S3_BUCKET: "moreigori-media/path", S3_ENDPOINT: "https://s3.timeweb.cloud" }),
    /without wildcards or path separators/,
  );
});

test("marketing images keep a single hero preload path and lazy card media", () => {
  const hero = readFileSync("src/components/marketing/page-hero.tsx", "utf8");
  const regionCard = readFileSync("src/components/marketing/region-card.tsx", "utf8");
  const objectCard = readFileSync("src/components/marketing/object-card.tsx", "utf8");

  assert.equal((hero.match(/\bpreload\b/g) ?? []).length, 1);
  assert.match(hero, /sizes="\(min-width: 1024px\) 46vw, 100vw"/);
  assert.match(hero, /className="object-cover"/);
  assert.match(regionCard, /loading="lazy"/);
  assert.match(regionCard, /sizes="\(min-width: 1024px\) 25vw, 100vw"/);
  assert.match(objectCard, /loading="lazy"/);
  assert.match(objectCard, /sizes="\(min-width: 1024px\) 33vw, 100vw"/);
});
