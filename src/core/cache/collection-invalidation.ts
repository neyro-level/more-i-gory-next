import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

import { composeRegionPathFromSlugs, REGION_RESERVED_NAMESPACE } from "../../content/regions/region-path-policy.ts";
import type { StructuredLogger } from "../observability/index.ts";
import {
  cacheTargets,
  createCacheInvalidationBatch,
  invalidateAfterCommit,
  type CacheInvalidationTargetBatch,
  type CacheInvalidator,
} from "./invalidation.ts";
import { createHttpRevalidateInvalidator } from "./http-revalidate-invalidator.ts";

export const cmsCacheEntities = [
  "pages",
  "properties",
  "regions",
  "residential-complexes",
  "developers",
  "redirects",
  "site-settings",
  "navigation",
] as const;

export type CmsCacheEntity = (typeof cmsCacheEntities)[number];

type CmsDoc = Readonly<Record<string, unknown>>;

function stringField(doc: CmsDoc, name: string): string | null {
  const value = doc[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parentSlug(value: unknown): string | null {
  if (value && typeof value === "object" && "slug" in value && typeof value.slug === "string") {
    return value.slug.trim() || null;
  }
  return null;
}

function regionPathSlug(doc: CmsDoc): string | null {
  const slug = stringField(doc, "slug");
  if (!slug) return null;

  const slugs = [slug];
  const parent = parentSlug(doc.parent);
  if (parent) slugs.unshift(parent);

  return composeRegionPathFromSlugs(slugs)
    .replace(new RegExp(`^${REGION_RESERVED_NAMESPACE}/`), "")
    .replace(/\/$/, "");
}

export function cmsMutationCacheTargets(entity: CmsCacheEntity, doc: CmsDoc = {}): CacheInvalidationTargetBatch {
  const slug = stringField(doc, "slug");

  switch (entity) {
    case "pages":
      return slug ? cacheTargets.pageDoc(slug) : [{ kind: "tag", tag: "page" }];
    case "properties":
      return slug
        ? createCacheInvalidationBatch(cacheTargets.propertyPage(slug), [{ kind: "tag", tag: "properties" }, { kind: "tag", tag: "sitemap" }])
        : createCacheInvalidationBatch(cacheTargets.catalogGroup(), [{ kind: "tag", tag: "properties" }, { kind: "tag", tag: "sitemap" }]);
    case "regions": {
      const regionSlug = regionPathSlug(doc);
      return regionSlug ? cacheTargets.regionPage(regionSlug) : cacheTargets.navigation();
    }
    case "residential-complexes":
      return slug
        ? createCacheInvalidationBatch(cacheTargets.complexPage(slug), [{ kind: "tag", tag: "complexes" }, { kind: "tag", tag: "sitemap" }])
        : createCacheInvalidationBatch(cacheTargets.catalogGroup(), [{ kind: "tag", tag: "complexes" }, { kind: "tag", tag: "sitemap" }]);
    case "developers":
      return slug
        ? createCacheInvalidationBatch(cacheTargets.developerPage(slug), [{ kind: "tag", tag: "sitemap" }])
        : createCacheInvalidationBatch([{ kind: "tag", tag: "developers" }, { kind: "tag", tag: "sitemap" }], cacheTargets.catalogGroup());
    case "redirects":
      return cacheTargets.redirects();
    case "site-settings":
      return cacheTargets.siteSettings();
    case "navigation":
      return cacheTargets.navigation();
  }
}

const defaultLogger: Pick<StructuredLogger, "error" | "info"> = {
  error(message, context) {
    console.error(message, context);
  },
  info() {},
};

export function createCmsMutationInvalidationHook(
  entity: CmsCacheEntity,
  deps?: {
    invalidator?: CacheInvalidator | (() => CacheInvalidator | Promise<CacheInvalidator>);
    logger?: Pick<StructuredLogger, "error" | "info">;
  },
): CollectionAfterChangeHook & CollectionAfterDeleteHook & GlobalAfterChangeHook {
  return async ({ doc }) => {
    const targets = cmsMutationCacheTargets(entity, (doc ?? {}) as CmsDoc);
    if (targets.length === 0) return;

    const invalidator =
      typeof deps?.invalidator === "function"
        ? await deps.invalidator()
        : (deps?.invalidator ?? (await createHttpRevalidateInvalidator()));

    await invalidateAfterCommit({
      invalidator,
      logger: deps?.logger ?? defaultLogger,
      targets,
    });
  };
}
