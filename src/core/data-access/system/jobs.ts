type PayloadJobRecord = {
  input?: unknown;
};

type PayloadJobsLike = {
  find: (args: {
    collection: "payload-jobs";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    where: Record<string, unknown>;
  }) => Promise<{ docs?: PayloadJobRecord[] }>;
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
  const result = await payload.find({
    collection: "payload-jobs",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
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
    },
  });

  return new Set(
    (result.docs ?? [])
      .map((job) => readLeadDeliveryId(job.input))
      .filter((leadDeliveryId): leadDeliveryId is string => leadDeliveryId !== null),
  );
}
