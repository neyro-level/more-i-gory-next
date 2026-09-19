import type { MetadataRoute } from "next";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { siteUrl } from "@/seo/metadata";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (resolveRuntimeContour() === "staging") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
