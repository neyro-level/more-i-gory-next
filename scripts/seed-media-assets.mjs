import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { mediaAssets } from "../src/content/media/media-assets.ts";

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
    const existing = await payload.find({
      collection: "media",
      limit: 1,
      overrideAccess: true,
      where: {
        filename: {
          equals: asset.filename,
        },
      },
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "media",
        data: asset.payloadData,
        filePath: asset.filePath,
        id: existing.docs[0].id,
        overrideAccess: true,
        overwriteExistingFiles: true,
      });
      payload.logger.info(`Updated media asset ${asset.id} from ${asset.src}`);
      continue;
    }

    await payload.create({
      collection: "media",
      data: asset.payloadData,
      filePath: asset.filePath,
      overrideAccess: true,
      overwriteExistingFiles: true,
    });
    payload.logger.info(`Created media asset ${asset.id} from ${asset.src}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await seed();
}
