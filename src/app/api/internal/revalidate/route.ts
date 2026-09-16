import { createCacheInvalidator } from "@/core/cache/invalidator";
import { handleInternalRevalidateRequest } from "@/core/cache/revalidate-endpoint";
import { env } from "@/project/env";

export const runtime = "nodejs";

const routeInvalidator = createCacheInvalidator({ branch: "approved-route-handler" });

export async function POST(request: Request) {
  return handleInternalRevalidateRequest(request, {
    invalidator: routeInvalidator,
    logger: console,
    secret: env.REVALIDATE_SECRET,
  });
}

export function GET(request: Request) {
  return handleInternalRevalidateRequest(request, {
    invalidator: routeInvalidator,
    logger: console,
    secret: env.REVALIDATE_SECRET,
  });
}

export { GET as DELETE, GET as OPTIONS, GET as PATCH, GET as PUT };
