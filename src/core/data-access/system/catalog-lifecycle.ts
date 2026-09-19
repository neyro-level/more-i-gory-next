import { planCatalogLifecycle } from "../../catalog/lifecycle.ts";

type CatalogLifecycleRecord = Readonly<{
  complex?: unknown;
  deactivatedAt?: string | null;
  id: number | string;
  market?: "secondary" | "newbuild" | null;
  region?: unknown;
  slug: string;
  status: "archived" | "active";
}>;

type RedirectRecord = Readonly<{
  destination?: string;
  id: number | string;
  source?: string;
}>;

type PayloadLike = {
  create?: (args: {
    collection: "redirects";
    data: { destination: string; permanent: true; source: string };
    overrideAccess: true;
  }) => Promise<unknown>;
  find?: (args: {
    collection: "properties" | "redirects";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select?: {
      complex?: true;
      deactivatedAt?: true;
      id: true;
      market?: true;
      region?: true;
      slug: true;
      status?: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{ docs?: Array<CatalogLifecycleRecord & RedirectRecord> }>;
  update?: (args: {
    collection: "redirects";
    data: { destination: string; permanent: true; source: string };
    id: number | string;
    overrideAccess: true;
  }) => Promise<unknown>;
};

const propertyIdentitySelect = {
  complex: true,
  deactivatedAt: true,
  id: true,
  market: true,
  region: true,
  slug: true,
  status: true,
} as const;

async function persistLifecycleRedirects(
  payload: PayloadLike,
  plan: ReturnType<typeof planCatalogLifecycle>,
): Promise<number> {
  let redirected = 0;

  for (const entry of plan.entries) {
    if (entry.action.kind !== "redirect") continue;

    const source = `/obekty/${entry.slug}/`;
    const destination = entry.action.target;
    if (destination === "/" || destination === "/obekty/") {
      throw new Error(`Redirect to generic home is not allowed: ${source} -> ${destination}`);
    }
    const existing = await payload.find?.({
      collection: "redirects",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { source: { equals: source } },
    });
    const current = existing?.docs?.[0];

    if (current) {
      if (String(current.destination ?? "") !== destination) {
        await payload.update?.({
          collection: "redirects",
          data: { destination, permanent: true, source },
          id: current.id,
          overrideAccess: true,
        });
      }
      redirected += 1;
      continue;
    }

    await payload.create?.({
      collection: "redirects",
      data: { destination, permanent: true, source },
      overrideAccess: true,
    });
    redirected += 1;
  }

  return redirected;
}

export async function catalogLifecycle(
  payload: PayloadLike,
  now = new Date(),
): Promise<{ expired: number; retained: number }> {
  const archivedResult = await payload.find?.({
    collection: "properties",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: propertyIdentitySelect,
    where: {
      and: [
        { origin: { equals: "manual" } },
        { status: { equals: "archived" } },
        { publishedAt: { exists: true } },
      ],
    },
  });
  const publishedResult = await payload.find?.({
    collection: "properties",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: propertyIdentitySelect,
    where: {
      and: [
        { origin: { equals: "manual" } },
        { status: { equals: "active" } },
        { publishedAt: { exists: true } },
      ],
    },
  });

  const archived = (archivedResult?.docs ?? []).filter(
    (doc): doc is CatalogLifecycleRecord & { status: "archived" } => doc.status === "archived",
  );
  const plan = planCatalogLifecycle(archived, now, publishedResult?.docs ?? []);
  await persistLifecycleRedirects(payload, plan);
  return { expired: plan.expired, retained: plan.retained };
}
