import { collectBoundedPages } from "../../lib/bounded-pagination.ts";

type PayloadJobRecord = {
  input?: unknown;
};

type PayloadJobsLike = {
  find: (args: {
    collection: "payload-jobs";
    depth: 0;
    limit: number;
    overrideAccess: true;
    page: number;
    pagination: true;
    where: Record<string, unknown>;
  }) => Promise<{ docs?: PayloadJobRecord[]; hasNextPage?: boolean }>;
};

function readLeadDeliveryId(input: unknown): string | null {
  if (
    typeof input === "object" &&
    input !== null &&
    "leadDeliveryId" in input &&
    typeof input.leadDeliveryId === "string"
  ) {
    return input.leadDeliveryId;
  }

  return null;
}

export async function findLiveDeliverLeadJobIds(
  payload: PayloadJobsLike,
): Promise<ReadonlySet<string>> {
  const where = {
    and: [
      { taskSlug: { equals: "deliverLead" } },
      { queue: { equals: "lead-deliveries" } },
      {
        or: [
          { completedAt: { exists: false } },
          { processing: { equals: true } },
        ],
      },
    ],
  } as const;

  const docs = await collectBoundedPages<PayloadJobRecord>({
    fetchPage: async (page, limit) =>
      payload.find({
        collection: "payload-jobs",
        depth: 0,
        limit,
        overrideAccess: true,
        page,
        pagination: true,
        where,
      }),
  });

  return new Set(
    docs
      .map((job) => readLeadDeliveryId(job.input))
      .filter((leadDeliveryId): leadDeliveryId is string => leadDeliveryId !== null),
  );
}
