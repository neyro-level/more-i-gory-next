import type { LeadDeliveryStatus } from "./delivery-state.ts";

export type LeadDeliveryAlertKind = "abandoned" | "backlog" | "failure_ratio" | "outage";

export type LeadDeliveryAlert = Readonly<{
  count?: number;
  failureRatio?: number;
  kind: LeadDeliveryAlertKind;
  severity: "critical" | "warning";
}>;

export type LeadDeliveryAlertSnapshot = Readonly<{
  abandoned: number;
  failed: number;
  pending: number;
  sending: number;
  sent: number;
}>;

export type LeadDeliveryAlertThresholds = Readonly<{
  abandoned?: number;
  backlog?: number;
  failureRatio?: number;
  outageFailures?: number;
}>;

export type LeadDeliveryAdminSummary = Readonly<{
  alerts: readonly LeadDeliveryAlert[];
  perLeadAlerts: false;
  statuses: Record<LeadDeliveryStatus, number>;
}>;

const defaultThresholds = {
  abandoned: 1,
  backlog: 25,
  failureRatio: 0.2,
  outageFailures: 5,
} satisfies Required<LeadDeliveryAlertThresholds>;

export function summarizeLeadDeliveryAdminState(
  snapshot: LeadDeliveryAlertSnapshot,
  thresholds: LeadDeliveryAlertThresholds = {},
): LeadDeliveryAdminSummary {
  const limits = { ...defaultThresholds, ...thresholds };
  const attempted = snapshot.sent + snapshot.failed + snapshot.abandoned;
  const failureRatio = attempted === 0 ? 0 : (snapshot.failed + snapshot.abandoned) / attempted;
  const alerts: LeadDeliveryAlert[] = [];

  if (failureRatio >= limits.failureRatio && attempted > 0) {
    alerts.push({ failureRatio, kind: "failure_ratio", severity: "warning" });
  }

  if (snapshot.abandoned >= limits.abandoned) {
    alerts.push({ count: snapshot.abandoned, kind: "abandoned", severity: "critical" });
  }

  if (snapshot.failed >= limits.outageFailures) {
    alerts.push({ count: snapshot.failed, kind: "outage", severity: "critical" });
  }

  if (snapshot.pending >= limits.backlog) {
    alerts.push({ count: snapshot.pending, kind: "backlog", severity: "warning" });
  }

  return {
    alerts,
    perLeadAlerts: false,
    statuses: {
      abandoned: snapshot.abandoned,
      failed: snapshot.failed,
      pending: snapshot.pending,
      sending: snapshot.sending,
      sent: snapshot.sent,
    },
  };
}
