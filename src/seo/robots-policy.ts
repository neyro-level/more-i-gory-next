import type { MetadataRoute } from "next";

import type { RuntimeContour } from "../project/runtime-contour.ts";
import { getSiteUrl } from "./site-url.ts";

export function buildRobotsPolicy(
  contour: RuntimeContour | undefined,
  source: NodeJS.ProcessEnv = process.env,
): MetadataRoute.Robots {
  if (contour !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: `${getSiteUrl(source)}/sitemap.xml`,
  };
}
