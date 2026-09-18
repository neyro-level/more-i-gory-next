import { parseActiveLeadChannels } from "../../core/leads/channels.ts";
import type { LeadDeliveryChannel } from "../../core/leads/delivery.ts";
import { createSafeOutboundClient, type SafeOutboundClient } from "../../core/security/outbound-http/index.ts";

/** Callers pass `env` from `@/project/env`. Do not read the process environment here. */
export type LeadChannelEnv = Readonly<{
  LEAD_CHANNELS?: string;
  LEAD_OUTBOUND_HOSTS?: string;
  OUTBOUND_ALLOWED_HOSTS?: string;
}>;

export class LeadChannelRegistryError extends Error {
  readonly safeCode = "lead_channel_fail_closed";

  constructor(message: string) {
    super(message);
    this.name = "LeadChannelRegistryError";
  }
}

const registeredChannelFactories: Readonly<
  Record<string, (input: { env: LeadChannelEnv; outbound: SafeOutboundClient }) => LeadDeliveryChannel>
> = {};

function parseOutboundHosts(projectEnv: LeadChannelEnv): readonly string[] {
  const raw = projectEnv.LEAD_OUTBOUND_HOSTS ?? projectEnv.OUTBOUND_ALLOWED_HOSTS;
  if (!raw) return [];

  return [
    ...new Set(
      raw
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function createLeadChannelRegistry(
  projectEnv: LeadChannelEnv,
  outbound: SafeOutboundClient = createSafeOutboundClient({
    allowedHosts: parseOutboundHosts(projectEnv),
  }),
): ReadonlyMap<string, LeadDeliveryChannel> {
  const channelIds = parseActiveLeadChannels(projectEnv.LEAD_CHANNELS);
  const registry = new Map<string, LeadDeliveryChannel>();

  for (const channelId of channelIds) {
    const factory = registeredChannelFactories[channelId];
    if (!factory) {
      throw new LeadChannelRegistryError(`Unknown or incomplete lead channel: ${channelId}`);
    }

    registry.set(channelId, factory({ env: projectEnv, outbound }));
  }

  return registry;
}
