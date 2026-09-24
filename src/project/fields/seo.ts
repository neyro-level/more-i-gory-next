import type { Field } from "payload";
import { isControlledCanonicalOverride } from "../../seo/seo-state.ts";

export const seoFields: Field = {
  name: "seo",
  type: "group",
  fields: [
    { name: "title", type: "text" },
    { name: "description", type: "textarea" },
    { name: "canonicalOverride", type: "text" },
    { name: "ogImagePath", type: "text" },
    {
      name: "robots",
      type: "select",
      defaultValue: "index-follow",
      options: [
        { label: "index, follow", value: "index-follow" },
        { label: "noindex, follow", value: "noindex-follow" },
      ],
      required: true,
    },
    {
      name: "priority",
      type: "select",
      defaultValue: "P2",
      options: [
        { label: "P1", value: "P1" },
        { label: "P2", value: "P2" },
        { label: "P3", value: "P3" },
      ],
      required: true,
    },
  ],
};

export function assertPublishedSeo(data: { seo?: { canonicalOverride?: unknown; description?: unknown; title?: unknown }; status?: unknown }): void {
  if (data.status !== "published") return;

  const title = typeof data.seo?.title === "string" ? data.seo.title.trim() : "";
  const description = typeof data.seo?.description === "string" ? data.seo.description.trim() : "";

  if (!title || !description) {
    throw new Error("Published CMS page requires seo.title and seo.description.");
  }

  const canonicalOverride = typeof data.seo?.canonicalOverride === "string" ? data.seo.canonicalOverride : undefined;
  if (!isControlledCanonicalOverride(canonicalOverride)) {
    throw new Error("Published CMS canonicalOverride must be a normalized internal path without query or fragment.");
  }
}
