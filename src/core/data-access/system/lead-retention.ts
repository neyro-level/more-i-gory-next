import {
  type RetainableLead,
  leadHistoryPurgeDays,
  leadRetentionDays,
  planLeadRetentionCleanup,
} from "../../leads/retention.ts";

type LeadRecord = Readonly<{ id: number | string }>;

type PayloadLike = {
  delete: (args: {
    collection: "lead-deliveries" | "leads";
    overrideAccess: true;
    where: Record<string, unknown>;
  }) => Promise<unknown>;
  find?: (args: {
    collection: "leads";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select: {
      createdAt: true;
      historyPurgeAt: true;
      id: true;
      piiAnonymizedAt: true;
      retentionStatus: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{ docs?: RetainableLead[] }>;
  update: (args: {
    collection: "leads";
    data: Record<string, unknown>;
    overrideAccess: true;
    where: Record<string, unknown>;
  }) => Promise<{ docs?: LeadRecord[] } | unknown>;
};

function daysAgo(now: Date, days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function leadRetentionCleanup(
  payload: PayloadLike,
  now = new Date(),
): Promise<{ anonymized: number; purged: number }> {
  const result = await payload.find?.({
    collection: "leads",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      createdAt: true,
      historyPurgeAt: true,
      id: true,
      piiAnonymizedAt: true,
      retentionStatus: true,
    },
    where: {
      or: [
        { createdAt: { less_than_equal: daysAgo(now, leadRetentionDays) } },
        { historyPurgeAt: { less_than_equal: now.toISOString() } },
        { createdAt: { less_than_equal: daysAgo(now, leadHistoryPurgeDays) } },
      ],
    },
  });

  const plan = planLeadRetentionCleanup(result?.docs ?? [], now);
  let anonymized = 0;
  let purged = 0;

  for (const action of plan.actions) {
    if (action.kind === "anonymize-pii") {
      const update = await payload.update({
        collection: "leads",
        data: action.data,
        overrideAccess: true,
        where: {
          and: [
            { id: { equals: String(action.id) } },
            {
              or: [
                { retentionStatus: { equals: "active" } },
                { retentionStatus: { exists: false } },
              ],
            },
          ],
        },
      });
      const updated = update as { docs?: LeadRecord[] };
      if (Array.isArray(updated.docs) && updated.docs.length > 0) {
        anonymized += 1;
      }
      continue;
    }

    await payload.delete({
      collection: "lead-deliveries",
      overrideAccess: true,
      where: { lead: { equals: String(action.id) } },
    });
    await payload.delete({
      collection: "leads",
      overrideAccess: true,
      where: { id: { equals: String(action.id) } },
    });
    purged += 1;
  }

  return { anonymized, purged };
}
