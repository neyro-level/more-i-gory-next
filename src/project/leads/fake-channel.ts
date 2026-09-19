import { LeadDeliveryFailure, unknownLeadDeliveryFailure, type LeadDeliveryChannel } from "../../core/leads/delivery.ts";

export type FakeLeadTransportMode =
  | "success"
  | "400"
  | "429"
  | "500"
  | "timeout-before-response"
  | "unknown-timeout";

export function createFakeLeadDeliveryChannel(mode: FakeLeadTransportMode): LeadDeliveryChannel {
  return {
    id: "fake",
    async deliver() {
      switch (mode) {
        case "success":
          return { classification: "sent", deliveryCertainty: "delivered", externalRef: "fake:1" };
        case "400":
          throw new LeadDeliveryFailure({
            deliveryCertainty: "not-delivered",
            redactedMessage: "Fake channel rejected the payload.",
            retryable: false,
            safeCode: "fake_rejected",
          });
        case "429":
        case "500":
          throw unknownLeadDeliveryFailure("fake_unavailable", "Fake channel failed before remote confirmation.");
        case "timeout-before-response":
        case "unknown-timeout":
          throw unknownLeadDeliveryFailure("fake_timeout", "Fake channel timed out before remote confirmation.");
        default: {
          const exhaustive: never = mode;
          throw unknownLeadDeliveryFailure("fake_unknown", String(exhaustive));
        }
      }
    },
  };
}
