export const regionOwnership = {
  code: "routing/composition policy",
  payload: "domain/content owner",
  seoRegistry: "explicit index policy",
} as const;

export const payloadOwnedRegionFields = [
  "title",
  "lead",
  "investmentThesis",
  "riskSummary",
  "heroMedia",
  "blocks",
  "status",
  "kind",
  "parent",
  "pageKey",
  "verifiedAt",
  "order",
  "slug",
] as const;

export const codeOwnedRegionPolicies = [
  "path-from-route-identity-and-hierarchy",
  "route-identity-builder",
  "internal-link-composition",
  "stub-presentation",
] as const;

export const seoRegistryOwnedFields = [
  "pageId",
  "canonical",
  "index",
  "sitemap",
  "priority",
  "contentGate",
] as const;
