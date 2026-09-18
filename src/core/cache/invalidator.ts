import "server-only";

import {
  createHttpCacheInvalidator,
  uniqueTargets,
  type CacheInvalidationTarget,
  type CacheInvalidator,
} from "./invalidation.ts";

export {
  cacheTargets,
  createCacheInvalidationBatch,
  createHttpCacheInvalidator,
  invalidateAfterCommit,
  uniqueTargets,
  type CacheInvalidationOperationalIssue,
  type CacheInvalidationResult,
  type CacheInvalidationTarget,
  type CacheInvalidationTargetBatch,
  type CacheInvalidator,
} from "./invalidation.ts";

type NextCacheModule = Readonly<{
  revalidatePath(path: string, type?: "layout" | "page"): void;
  revalidateTag(tag: string, profile: "max"): void;
}>;

type CacheInvalidationBranch =
  | Readonly<{
      branch: "approved-route-handler";
      loadNextCache?: () => Promise<NextCacheModule>;
    }>
  | Readonly<{
      branch: "http";
      invalidateBatch(targets: readonly CacheInvalidationTarget[]): Promise<void>;
    }>;

export function createCacheInvalidator(branch: CacheInvalidationBranch): CacheInvalidator {
  if (branch.branch === "http") {
    return createHttpCacheInvalidator(branch.invalidateBatch);
  }

  return {
    async invalidate(targets) {
      const batch = uniqueTargets(targets);
      if (batch.length === 0) return;

      const nextCache = branch.loadNextCache
        ? await branch.loadNextCache()
        : await import("next/cache");

      for (const target of batch) {
        if (target.kind === "tag") {
          nextCache.revalidateTag(target.tag, "max");
        } else {
          nextCache.revalidatePath(target.path, target.type);
        }
      }
    },
  };
}
