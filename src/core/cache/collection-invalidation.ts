import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

import { regionRouteEntries, getRegionRoutePath } from "../../content/regions/region-route-plan.ts";
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

function regionPathSlug(doc: CmsDoc): string | null {
  const slug = stringField(doc, "slug");
  if (!slug) return null;
  const entry = regionRouteEntries.find((item) => item.slug === slug || item.key === slug);
  if (!entry) return slug;
  return getRegionRoutePath(entry)
    .replace(/^\/investicionnaya-nedvizhimost\//, "")
    .replace(/\/$/, "");
}

export function cmsMutationCacheTargets(entity: CmsCacheEntity, doc: CmsDoc = {}): CacheInvalidationTargetBatch {
  const slug = stringField(doc, "slug");

  switch (entity) {
    case "pages":
      return slug ? cacheTargets.pageDoc(slug) : [{ kind: "tag", tag: "page" }];
    case "properties":
      return slug
        ? createCacheInvalidationBatch(cacheTargets.propertyPage(slug), [{ kind: "tag", tag: "properties" }])
        : createCacheInvalidationBatch(cacheTargets.catalogGroup(), [{ kind: "tag", tag: "properties" }]);
    case "regions": {
      const regionSlug = regionPathSlug(doc);
      return regionSlug ? cacheTargets.regionPage(regionSlug) : cacheTargets.navigation();
    }
    case "residential-complexes":
      return slug
        ? createCacheInvalidationBatch(cacheTargets.complexPage(slug), [{ kind: "tag", tag: "complexes" }])
        : createCacheInvalidationBatch(cacheTargets.catalogGroup(), [{ kind: "tag", tag: "complexes" }]);
    case "developers":
      return slug
        ? cacheTargets.developerPage(slug)
        : createCacheInvalidationBatch([{ kind: "tag", tag: "developers" }], cacheTargets.catalogGroup());
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
