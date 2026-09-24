export type StaticPageKey =
  | "HOME"
  | "FEDERAL_INVESTMENT_HUB"
  | "INVESTMENT_CATALOG"
  | "ANALYTICS"
  | "METHODOLOGY"
  | "SELECTION"
  | "COMPANY"
  | "CONTACTS"
  | "PRIVACY"
  | "CONSENT";

export type RouteIdentity =
  | Readonly<{ pageKey: StaticPageKey }>
  | Readonly<{ pageKey: "REGION"; regionSlug: string }>
  | Readonly<{ pageKey: "CITY"; regionSlug: string; citySlug: string }>
  | Readonly<{ pageKey: "INVESTMENT_PROJECT"; projectSlug: string }>
  | Readonly<{ pageKey: "ARTICLE"; articleSlug: string }>;

const staticRouteByPageKey = {
  HOME: "/",
  FEDERAL_INVESTMENT_HUB: "/investicionnaya-nedvizhimost/",
  INVESTMENT_CATALOG: "/obekty/",
  ANALYTICS: "/analitika/",
  METHODOLOGY: "/metodika/",
  SELECTION: "/podbor/",
  COMPANY: "/o-kompanii/",
  CONTACTS: "/kontakty/",
  PRIVACY: "/privacy/",
  CONSENT: "/consent/",
} as const satisfies Record<StaticPageKey, `/${string}`>;

const pageKeyByStaticRoute = new Map<string, StaticPageKey>(
  Object.entries(staticRouteByPageKey).map(([pageKey, path]) => [path, pageKey as StaticPageKey]),
);

const reservedRootSegments = new Set([
  "_next",
  "admin",
  "agenty",
  "analitika",
  "apartamenty",
  "api",
  "consent",
  "investicionnaya-nedvizhimost",
  "journal",
  "komplex",
  "kontakty",
  "metodika",
  "novostroyki",
  "o-kompanii",
  "obekty",
  "podbor",
  "privacy",
  "zastroyshchik",
]);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertSlug(value: string, field: string): void {
  if (!slugPattern.test(value)) throw new TypeError(`Invalid ${field} "${value}".`);
}

function assertGeographySlug(value: string, field: string): void {
  assertSlug(value, field);
  if (reservedRootSegments.has(value)) throw new TypeError(`Reserved ${field} "${value}".`);
}

function canonicalSegments(path: string): readonly string[] | null {
  if (path === "/") return [];
  if (!path.startsWith("/") || /[?#%\\]/.test(path) || path.includes("//") || path.trim() !== path) return null;

  const withoutTrailingSlash = path.endsWith("/") ? path.slice(0, -1) : path;
  const segments = withoutTrailingSlash.slice(1).split("/");
  return segments.length > 0 && segments.every((segment) => slugPattern.test(segment)) ? segments : null;
}

function isStaticRouteIdentity(identity: RouteIdentity): identity is Readonly<{ pageKey: StaticPageKey }> {
  return Object.hasOwn(staticRouteByPageKey, identity.pageKey);
}

export function buildUrl(identity: RouteIdentity): `/${string}` {
  if (isStaticRouteIdentity(identity)) return staticRouteByPageKey[identity.pageKey];

  switch (identity.pageKey) {
    case "REGION":
      assertGeographySlug(identity.regionSlug, "regionSlug");
      return `/${identity.regionSlug}/`;
    case "CITY":
      assertGeographySlug(identity.regionSlug, "regionSlug");
      assertGeographySlug(identity.citySlug, "citySlug");
      if (identity.regionSlug === identity.citySlug) {
        throw new TypeError(`Geography slug collision "${identity.regionSlug}".`);
      }
      return `/${identity.regionSlug}/${identity.citySlug}/`;
    case "INVESTMENT_PROJECT":
      assertSlug(identity.projectSlug, "projectSlug");
      return `/obekty/${identity.projectSlug}/`;
    case "ARTICLE":
      assertSlug(identity.articleSlug, "articleSlug");
      return `/analitika/${identity.articleSlug}/`;
  }
}

export function parseUrl(path: string): RouteIdentity | null {
  const segments = canonicalSegments(path);
  if (!segments) return null;
  if (segments.length === 0) return { pageKey: "HOME" };

  const canonical = `/${segments.join("/")}/`;
  const staticPageKey = pageKeyByStaticRoute.get(canonical);
  if (staticPageKey) return { pageKey: staticPageKey };

  if (segments.length === 1) {
    const [regionSlug] = segments;
    if (!regionSlug || reservedRootSegments.has(regionSlug)) return null;
    return { pageKey: "REGION", regionSlug };
  }

  if (segments.length !== 2) return null;
  const [rootSlug, leafSlug] = segments;
  if (!rootSlug || !leafSlug) return null;

  if (rootSlug === "obekty") return { pageKey: "INVESTMENT_PROJECT", projectSlug: leafSlug };
  if (rootSlug === "analitika") return { pageKey: "ARTICLE", articleSlug: leafSlug };
  if (reservedRootSegments.has(rootSlug) || reservedRootSegments.has(leafSlug) || rootSlug === leafSlug) return null;

  return { pageKey: "CITY", regionSlug: rootSlug, citySlug: leafSlug };
}

export const routeGrammar = Object.freeze({ buildUrl, parseUrl });
