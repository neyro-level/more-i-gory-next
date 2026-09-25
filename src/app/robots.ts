import type { MetadataRoute } from "next";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { buildRobotsPolicy } from "@/seo/robots-policy";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return buildRobotsPolicy(resolveRuntimeContour());
}
