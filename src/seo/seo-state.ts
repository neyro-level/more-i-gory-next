export type SeoRegistryPolicy = Readonly<{
  canonical: string;
  index: "yes" | "gate" | "trust_gate" | "noindex";
  sitemap: "yes" | "gate" | "no";
}>;

export type CmsSeoPolicy = Readonly<{
  canonicalOverride?: string | null;
  robots?: "index-follow" | "noindex-follow" | null;
}>;

export type SeoPublicationStatus =
  | "active"
  | "archived"
  | "draft"
  | "hidden"
  | "published"
  | "review"
  | "stub";

export type SeoRuntimeContour = "development" | "production" | "staging";

export type EffectiveSeoState = Readonly<{
  canonical: string;
  follow: boolean;
  httpStatus: 200 | 404 | 410;
  index: boolean;
  reason: string;
  redirectIntent: Readonly<{ status: 301 | 308; target: string }> | null;
  sitemap: boolean;
}>;

export type SeoStateInput = Readonly<{
  canonical: string;
  cmsSeo?: CmsSeoPolicy | null;
  contentGate?: "pass" | "fail" | "missing";
  lifecycle?: "active" | "archived" | "gone";
  preview?: boolean;
  publicationStatus?: SeoPublicationStatus;
  redirectIntent?: Readonly<{ status: 301 | 308; target: string }> | null;
  registry?: SeoRegistryPolicy | null;
  routeSupported?: boolean;
  runtimeContour?: SeoRuntimeContour;
  technical?: boolean;
}>;

export function normalizeCanonicalPath(value: string): string | null {
  const candidate = value.trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//") || /[?#\\]/.test(candidate)) return null;
  if (candidate === "/") return candidate;
  return `/${candidate.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

export function isControlledCanonicalOverride(value: string | null | undefined): boolean {
  return value == null || value === "" || normalizeCanonicalPath(value) !== null;
}

function publicationAllowsIndex(status: SeoPublicationStatus | undefined): boolean {
  return status === undefined || status === "published" || status === "active";
}

export function resolveSeoState(input: SeoStateInput): EffectiveSeoState {
  const baseCanonical = normalizeCanonicalPath(input.canonical);
  if (!baseCanonical) throw new Error(`Invalid canonical path: ${input.canonical}`);

  const rawOverride = input.cmsSeo?.canonicalOverride?.trim();
  const overrideCanonical = rawOverride ? normalizeCanonicalPath(rawOverride) : null;
  const invalidOverride = Boolean(rawOverride && !overrideCanonical);
  const canonical = overrideCanonical ?? baseCanonical;
  const lifecycle = input.lifecycle ?? "active";
  const routeSupported = input.routeSupported ?? true;
  const runtimeContour = input.runtimeContour ?? "production";
  const redirectTarget = input.redirectIntent ? normalizeCanonicalPath(input.redirectIntent.target) : null;
  const redirectIntent = input.redirectIntent && redirectTarget
    ? { status: input.redirectIntent.status, target: redirectTarget }
    : null;
  const invalidRedirect = Boolean(input.redirectIntent && !redirectTarget);
  const httpStatus: EffectiveSeoState["httpStatus"] = lifecycle === "gone" ? 410 : routeSupported ? 200 : 404;

  const blockers = [
    [httpStatus !== 200, `http-${httpStatus}`],
    [Boolean(redirectIntent), "redirect"],
    [invalidRedirect, "invalid-redirect"],
    [invalidOverride, "invalid-canonical-override"],
    [runtimeContour !== "production", `runtime-${runtimeContour}`],
    [input.preview === true, "preview"],
    [input.technical === true, "technical"],
    [!publicationAllowsIndex(input.publicationStatus), `publication-${input.publicationStatus ?? "unknown"}`],
    [lifecycle !== "active", `lifecycle-${lifecycle}`],
    [input.registry != null && input.registry.index !== "yes", `registry-${input.registry?.index}`],
    [input.contentGate != null && input.contentGate !== "pass", `content-gate-${input.contentGate}`],
    [input.cmsSeo?.robots === "noindex-follow", "cms-noindex"],
  ] as const;
  const blocker = blockers.find(([blocked]) => blocked)?.[1];
  const index = blocker === undefined;
  const registryAllowsSitemap = input.registry == null || input.registry.sitemap === "yes";
  const sitemap = index && httpStatus === 200 && registryAllowsSitemap;

  return {
    canonical,
    follow: httpStatus === 200,
    httpStatus,
    index,
    reason: blocker ?? "indexable",
    redirectIntent,
    sitemap,
  };
}
