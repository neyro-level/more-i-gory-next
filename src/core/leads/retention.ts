const dayMs = 24 * 60 * 60 * 1000;

export const leadRetentionDays = 100;
export const leadHistoryRecoveryDays = 200;
export const leadHistoryPurgeDays = leadRetentionDays + leadHistoryRecoveryDays;

export type RetainableLead = Readonly<{
  createdAt: string;
  historyPurgeAt?: string | null;
  id: number | string;
  piiAnonymizedAt?: string | null;
  retentionStatus?: "active" | "pii_anonymized" | null;
}>;

export type LeadRetentionAction =
  | Readonly<{
      data: {
        email: null;
        historyPurgeAt: string;
        message: string;
        metadata: null;
        name: string;
        phone: string;
        piiAnonymizedAt: string;
        retentionStatus: "pii_anonymized";
        utm: null;
      };
      id: number | string;
      kind: "anonymize-pii";
    }>
  | Readonly<{
      id: number | string;
      kind: "purge-history";
    }>;

export type LeadRetentionPlan = Readonly<{
  actions: readonly LeadRetentionAction[];
  anonymized: number;
  purged: number;
  recoveryDays: number;
  retentionDays: number;
  totalDays: number;
}>;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayMs);
}

function parseTimestamp(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function ageDays(createdAt: string, now: Date): number | null {
  const createdAtMs = parseTimestamp(createdAt);
  if (createdAtMs === null) return null;
  return Math.floor((now.getTime() - createdAtMs) / dayMs);
}

function historyPurgeAt(lead: RetainableLead): string {
  const createdAt = new Date(lead.createdAt);
  return addDays(createdAt, leadHistoryPurgeDays).toISOString();
}

function shouldPurge(lead: RetainableLead, now: Date): boolean {
  const scheduledPurgeAt = parseTimestamp(lead.historyPurgeAt);
  if (scheduledPurgeAt !== null && scheduledPurgeAt <= now.getTime()) return true;

  const age = ageDays(lead.createdAt, now);
  return age !== null && age >= leadHistoryPurgeDays;
}

function shouldAnonymize(lead: RetainableLead, now: Date): boolean {
  if (lead.retentionStatus === "pii_anonymized" || lead.piiAnonymizedAt) return false;

  const age = ageDays(lead.createdAt, now);
  return age !== null && age >= leadRetentionDays;
}

export function planLeadRetentionCleanup(
  leads: readonly RetainableLead[],
  now = new Date(),
): LeadRetentionPlan {
  const nowIso = now.toISOString();
  const actions: LeadRetentionAction[] = [];

  for (const lead of leads) {
    if (shouldPurge(lead, now)) {
      actions.push({ id: lead.id, kind: "purge-history" });
      continue;
    }

    if (shouldAnonymize(lead, now)) {
      actions.push({
        data: {
          email: null,
          historyPurgeAt: historyPurgeAt(lead),
          message: "Lead PII anonymized by retention policy.",
          metadata: null,
          name: "Anonymized lead",
          phone: "redacted",
          piiAnonymizedAt: nowIso,
          retentionStatus: "pii_anonymized",
          utm: null,
        },
        id: lead.id,
        kind: "anonymize-pii",
      });
    }
  }

  return {
    actions,
    anonymized: actions.filter((action) => action.kind === "anonymize-pii").length,
    purged: actions.filter((action) => action.kind === "purge-history").length,
    recoveryDays: leadHistoryRecoveryDays,
    retentionDays: leadRetentionDays,
    totalDays: leadHistoryPurgeDays,
  };
}
