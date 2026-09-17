import { planCatalogLifecycle } from "../../catalog/lifecycle.ts";

type CatalogLifecycleRecord = Readonly<{
  deactivatedAt?: string | null;
  id: number | string;
  slug: string;
  status: "archived";
}>;

type PayloadLike = {
  find?: (args: {
    collection: "properties";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select: {
      deactivatedAt: true;
      id: true;
      slug: true;
      status: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{ docs?: CatalogLifecycleRecord[] }>;
};

export async function catalogLifecycle(
  payload: PayloadLike,
  now = new Date(),
): Promise<{ expired: number; retained: number }> {
  const result = await payload.find?.({
    collection: "properties",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      deactivatedAt: true,
      id: true,
      slug: true,
      status: true,
    },
    where: {
      and: [
        { origin: { equals: "manual" } },
        { status: { equals: "archived" } },
        { publishedAt: { exists: true } },
      ],
    },
  });

  const plan = planCatalogLifecycle(result?.docs ?? [], now);
  return { expired: plan.expired, retained: plan.retained };
}
