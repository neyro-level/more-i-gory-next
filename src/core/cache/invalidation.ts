import type { StructuredLogger } from "../observability/index.ts";

export type CacheInvalidationTarget =
  | Readonly<{ kind: "path"; path: string; type?: "layout" | "page" }>
  | Readonly<{ kind: "tag"; tag: string }>;

export type CacheInvalidationTargetBatch = readonly CacheInvalidationTarget[];

export interface CacheInvalidator {
  invalidate(targets: CacheInvalidationTargetBatch): Promise<void>;
}

export type CacheInvalidationOperationalIssue = Readonly<{
  code: "cache_invalidation_failed";
  targetCount: number;
}>;

export type CacheInvalidationResult =
  | Readonly<{ status: "ok"; targetCount: number }>
  | Readonly<{ issue: CacheInvalidationOperationalIssue; status: "operational-issue" }>;

function targetKey(target: CacheInvalidationTarget): string {
  if (target.kind === "tag") return `tag:${target.tag}`;
  return `path:${target.path}:${target.type ?? ""}`;
}

export function uniqueTargets(
  targets: readonly CacheInvalidationTarget[],
): readonly CacheInvalidationTarget[] {
  const unique = new Map<string, CacheInvalidationTarget>();
  for (const target of targets) unique.set(targetKey(target), target);
  return [...unique.values()];
}

export function createHttpCacheInvalidator(
  invalidateBatch: (targets: readonly CacheInvalidationTarget[]) => Promise<void>,
): CacheInvalidator {
  return {
    async invalidate(targets) {
      const batch = uniqueTargets(targets);
      if (batch.length === 0) return;
      await invalidateBatch(batch);
    },
  };
}

function normalizeSlug(slug: string, label: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(normalized)) {
    throw new Error(`Invalid cache target ${label}.`);
  }
  return normalized;
}

function pagePath(slug: string): string {
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  if (normalized === "") return "/";
  if (!/^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(normalized)) {
    throw new Error("Invalid cache target page slug.");
  }
  return `/${normalized}/`;
}

function tagSlug(slug: string, label: string): string {
  return normalizeSlug(slug, label).replaceAll("/", ":");
}

export const cacheTargets = {
  catalogGroup(): CacheInvalidationTargetBatch {
    return [
      { kind: "tag", tag: "catalog" },
      { kind: "path", path: "/obekty/" },
      { kind: "path", path: "/novostroyki/" },
    ];
  },
  catalogSlice(slug: string): CacheInvalidationTargetBatch {
    const normalized = normalizeSlug(slug, "catalog slice slug");
    return [
      { kind: "tag", tag: `catalog-slice:${tagSlug(slug, "catalog slice slug")}` },
      { kind: "path", path: `/investicionnaya-nedvizhimost/${normalized}/` },
      ...this.catalogGroup(),
    ];
  },
  complexPage(slug: string): CacheInvalidationTargetBatch {
    const normalized = normalizeSlug(slug, "complex slug");
    return [
      { kind: "tag", tag: `complex:${tagSlug(slug, "complex slug")}` },
      { kind: "path", path: `/novostroyki/${normalized}/` },
      ...this.catalogGroup(),
    ];
  },
  importAffectedBatch({
    complexSlugs = [],
    sliceSlugs = [],
  }: Readonly<{
    complexSlugs?: readonly string[];
    sliceSlugs?: readonly string[];
  }>): CacheInvalidationTargetBatch {
    return createCacheInvalidationBatch(
      this.catalogGroup(),
      ...complexSlugs.map((slug) => this.complexPage(slug)),
      ...sliceSlugs.map((slug) => this.catalogSlice(slug)),
    );
  },
  navigation(): CacheInvalidationTargetBatch {
    return [{ kind: "tag", tag: "navigation" }];
  },
  pageDoc(slug: string): CacheInvalidationTargetBatch {
    return [
      { kind: "tag", tag: `page:${tagSlug(slug, "page slug")}` },
      { kind: "path", path: pagePath(slug) },
    ];
  },
  propertyPage(slug: string): CacheInvalidationTargetBatch {
    const normalized = normalizeSlug(slug, "property slug");
    return [
      { kind: "tag", tag: `property:${tagSlug(slug, "property slug")}` },
      { kind: "path", path: `/obekty/${normalized}/` },
      ...this.catalogGroup(),
    ];
  },
  regionPage(slug: string): CacheInvalidationTargetBatch {
    const normalized = normalizeSlug(slug, "region slug");
    return [
      { kind: "tag", tag: `region:${tagSlug(slug, "region slug")}` },
      { kind: "path", path: `/investicionnaya-nedvizhimost/${normalized}/` },
      ...this.navigation(),
    ];
  },
  siteSettings(): CacheInvalidationTargetBatch {
    return [
      { kind: "tag", tag: "site-settings" },
      ...this.navigation(),
    ];
  },
} as const;

export function createCacheInvalidationBatch(
  ...targetGroups: readonly CacheInvalidationTargetBatch[]
): CacheInvalidationTargetBatch {
  return uniqueTargets(targetGroups.flat());
}

export async function invalidateAfterCommit({
  invalidator,
  logger,
  targets,
}: Readonly<{
  invalidator: CacheInvalidator;
  logger: Pick<StructuredLogger, "error" | "info">;
  targets: CacheInvalidationTargetBatch;
}>): Promise<CacheInvalidationResult> {
  try {
    await invalidator.invalidate(targets);
    logger.info("cache invalidation completed", { targetCount: targets.length });
    return { status: "ok", targetCount: targets.length };
  } catch {
    const issue = {
      code: "cache_invalidation_failed",
      targetCount: targets.length,
    } satisfies CacheInvalidationOperationalIssue;
    logger.error("cache invalidation operational issue", issue);
    return { issue, status: "operational-issue" };
  }
}
