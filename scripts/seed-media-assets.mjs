import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { mediaAssets } from "../src/content/media/media-assets.ts";
import { upsertMediaSeedAsset } from "../src/core/data-access/system/seed-media.ts";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function getSeedMediaAssets() {
  const filenames = new Set();

  for (const asset of mediaAssets) {
    const filename = path.basename(asset.src);
    if (filenames.has(filename)) throw new Error(`Duplicate media filename: ${filename}`);
    filenames.add(filename);
  }

  return mediaAssets;
}

export function getPublicAssetPath(asset) {
  return path.join(rootDir, "public", asset.src.replace(/^\//, ""));
}

export function getPayloadMediaData(asset) {
  return {
    alt: asset.alt,
    decorative: asset.decorative,
    kind: asset.kind,
    sourceLabel: asset.id,
  };
}

export function getSeedPlan() {
  return getSeedMediaAssets().map((asset) => {
    const filePath = getPublicAssetPath(asset);
    if (!existsSync(filePath)) throw new Error(`Missing source asset: ${asset.src}`);

    return {
      ...asset,
      filePath,
      filename: path.basename(asset.src),
      filesize: statSync(filePath).size,
      payloadData: getPayloadMediaData(asset),
    };
  });
}

async function seed() {
  const dryRun = process.argv.includes("--dry-run");
  const plan = getSeedPlan();

  if (plan.length !== 4) {
    throw new Error(`Expected 4 seed media assets, got ${plan.length}.`);
  }

  if (dryRun) {
    console.table(plan.map(({ filename, filesize, id, kind, src }) => ({ id, kind, filename, src, filesize })));
    return;
  }

  const [{ getPayload }, { default: config }] = await Promise.all([import("payload"), import("../payload.config.ts")]);
  const payload = await getPayload({ config });

  for (const asset of plan) {
    const outcome = await upsertMediaSeedAsset(payload, {
      data: asset.payloadData,
      filename: asset.filename,
      filePath: asset.filePath,
    });
    payload.logger.info(`${outcome === "updated" ? "Updated" : "Created"} media asset ${asset.id} from ${asset.src}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seed();
}
